#!/usr/bin/env node
import { Command } from "commander";
import { Zkp2pClient, setLogLevel } from "@zkp2p/sdk";
import {
  createWalletClient,
  http,
  isAddress,
  erc20Abi,
  formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import {
  decimal,
  platforms,
  validateCreate,
  depositId,
  json,
  safeError,
} from "./core.js";
setLogLevel("error");
const output = (value) => console.log(json(value));
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
function client(write = false, owner) {
  const key = process.env.PAYHUMANS_PRIVATE_KEY || process.env.DEPLOYER_KEY;
  if (write && !key)
    throw new Error(
      "Set PAYHUMANS_PRIVATE_KEY in your secret environment before using --yes. Never put a key in a command argument.",
    );
  const account = write
    ? privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`)
    : owner || "0x0000000000000000000000000000000000000001";
  const rpcUrl = process.env.PAYHUMANS_RPC_URL || "https://mainnet.base.org";
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
  return new Zkp2pClient({
    walletClient,
    rpcUrl,
    chainId: 8453,
    runtimeEnv: "production",
  });
}
async function receipt(c, hash) {
  const r = await c.publicClient.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`Transaction reverted: ${hash}`);
  return {
    transactionHash: hash,
    blockNumber: r.blockNumber,
    gasUsed: r.gasUsed,
    gasPrice: r.effectiveGasPrice,
  };
}
async function preflight(c) {
  if ((await c.publicClient.getChainId()) !== 8453)
    throw new Error("RPC is not Base mainnet.");
  const account = c.walletClient.account.address;
  const [latest, pending] = await Promise.all(
    ["latest", "pending"].map((blockTag) =>
      c.publicClient.getTransactionCount({ address: account, blockTag }),
    ),
  );
  if (pending !== latest)
    throw new Error("Wallet has pending transactions. Wait before retrying.");
}
const program = new Command()
  .name("payhumans")
  .description(
    "Fund verified fiat payment requests. USDC on Base. Writes preview by default.",
  )
  .version("0.1.0");
program
  .command("platforms")
  .description("List supported deposit platforms and currencies")
  .action(() => output({ chainId: 8453, platforms: platforms() }));
const deposits = program
  .command("deposit")
  .description("Create and manage payment-request deposits");
deposits
  .command("create")
  .description(
    "Preview a deposit; --yes approves exactly the deposit amount and broadcasts",
  )
  .requiredOption("--platform <name>", "Payment platform")
  .requiredOption(
    "--recipient <id>",
    "Recipient identifier accepted by the payment platform",
  )
  .requiredOption("--amount <usdc>", "USDC to escrow")
  .requiredOption("--currency <code>", "Fiat currency")
  .requiredOption(
    "--rate <fiat-per-usdc>",
    "Fiat units the human sends per USDC received",
  )
  .option("--min <usdc>", "Minimum claim size (defaults to entire deposit)")
  .option("--max <usdc>", "Maximum claim size (defaults to entire deposit)")
  .option(
    "--max-spend <usdc>",
    "Reject deposits above this USDC cap (gas is additional)",
  )
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const p = validateCreate(opts);
    const preview = {
      mode: opts.yes ? "execute" : "preview",
      chainId: 8453,
      token: "USDC",
      platform: p.platform,
      recipient: p.recipient,
      amount: formatUnits(p.amount, 6),
      currency: p.currency,
      fiatPerUsdc: formatUnits(p.rate, 18),
      minimumClaim: formatUnits(p.min, 6),
      maximumClaim: formatUnits(p.max, 6),
      note: "The human sends fiat to this recipient and receives escrowed USDC after proof verification. Gas is additional. Recipient details are registered with the underlying payment protocol when executed.",
    };
    if (!opts.yes) {
      output({
        ...preview,
        next: "Review these details, then repeat with --yes to create the deposit.",
      });
      return;
    }
    const c = client(true);
    await preflight(c);
    const balance = await c.publicClient.readContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [c.walletClient.account.address],
    });
    if (balance < p.amount) throw new Error("Insufficient Base USDC balance.");
    const params = {
      token: USDC,
      amount: p.amount,
      intentAmountRange: { min: p.min, max: p.max },
      processorNames: [p.platform],
      payeeData: [{ offchainId: p.recipient }],
      conversionRates: [
        [{ currency: p.currency, conversionRate: p.rate.toString() }],
      ],
    };
    // Resolve/validate recipient before approving funds. Send the exact prepared calldata once.
    const prepared = await c.prepareCreateDeposit(params);
    const spender =
      c.getDeployedAddresses().escrowV2 ?? c.getDeployedAddresses().escrow;
    const { to, data, value } = prepared.prepared;
    if (to.toLowerCase() !== spender.toLowerCase() || (value ?? 0n) !== 0n)
      throw new Error("Unexpected deposit contract or value.");
    const approval = await c.ensureAllowance({
      token: USDC,
      spender,
      amount: p.amount,
      maxApprove: false,
    });
    const approvalReceipt = approval.hash
      ? await receipt(c, approval.hash)
      : null;
    await c.publicClient.call({
      account: c.walletClient.account,
      to,
      data,
      value: 0n,
    });
    const hash = await c.walletClient.sendTransaction({
      to,
      data,
      value: value ?? 0n,
    });
    // Emit the hash immediately so a timeout cannot hide a submitted transaction.
    console.error(
      json({
        stage: "submitted",
        transactionHash: hash,
        explorer: `https://basescan.org/tx/${hash}`,
      }),
    );
    const confirmed = await receipt(c, hash);
    const { parseEventLogs } = await import("viem");
    const logs = await c.publicClient.getTransactionReceipt({ hash });
    const { getContracts } = await import("@zkp2p/sdk");
    const abi =
      getContracts(8453, "production").abis.escrowV2 ??
      getContracts(8453, "production").abis.escrow;
    const event = parseEventLogs({ abi, logs: logs.logs, strict: false }).find(
      (e) => e.eventName === "DepositReceived",
    );
    const id = event?.args?.depositId;
    output({
      ...preview,
      ...confirmed,
      approval: approvalReceipt,
      depositId: id?.toString() ?? null,
      claimUrl:
        id !== undefined ? `https://payhumans.ai/earn?deposit=${id}` : null,
    });
  });
deposits
  .command("show")
  .argument("<id>", "Deposit ID")
  .action(async (id) => output(await client().getDeposit(depositId(id))));
deposits
  .command("list")
  .requiredOption("--owner <address>", "Deposit owner")
  .action(async (opts) => {
    if (!isAddress(opts.owner)) throw new Error("Invalid owner address.");
    output(await client(false, opts.owner).getAccountDeposits(opts.owner));
  });
deposits
  .command("withdraw")
  .requiredOption("--id <id>", "Deposit ID")
  .requiredOption("--amount <usdc>", "Available USDC to withdraw")
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const id = depositId(opts.id),
      amount = decimal(opts.amount, "amount");
    if (!opts.yes) {
      output({
        mode: "preview",
        chainId: 8453,
        depositId: id,
        amount: formatUnits(amount, 6),
        note: "Withdraw available funds to the deposit owner. Reserved funds cannot be withdrawn.",
      });
      return;
    }
    const c = client(true);
    await preflight(c);
    const d = await c.getDeposit(id);
    if (
      d.deposit.depositor.toLowerCase() !==
      c.walletClient.account.address.toLowerCase()
    )
      throw new Error("Connected wallet does not own this deposit.");
    if (d.availableLiquidity < amount)
      throw new Error(
        "Insufficient available liquidity; claimed funds are reserved.",
      );
    const hash = await c.removeFunds({ depositId: id, amount });
    console.error(json({ stage: "submitted", transactionHash: hash }));
    output(await receipt(c, hash));
  });
program.parseAsync().catch((error) => {
  console.error(json({ error: safeError(error) }));
  process.exitCode = 1;
});
