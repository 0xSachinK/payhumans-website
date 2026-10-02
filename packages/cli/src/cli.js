#!/usr/bin/env node
import { Command } from "commander";
import { Zkp2pClient, setLogLevel, getContracts, getPaymentMethodsCatalog } from "@zkp2p/sdk";
import {
  createWalletClient,
  http,
  isAddress,
  erc20Abi,
  formatUnits,
  formatEther,
  parseEther,
  parseEventLogs,
} from "viem";
import { base } from "viem/chains";
import {
  decimal,
  platforms,
  validateCreate,
  depositId,
  json,
  safeError,
} from "./core.js";
import {
  ESCROW_CHAIN_ID,
  ESCROW_USDC,
  cashClient,
  escrowAccount,
  executeFromEscrow,
  executeFromSolana,
  loadSolanaKeypair,
  quoteEscrowGas,
  quoteEscrowToSolana,
  quoteSolanaUsdcToEscrow,
  quoteSummary,
  solanaBalances,
  solanaConnection,
  waitForRelay,
} from "./solana.js";
setLogLevel("error");
const output = (value) => console.log(json(value));
const log = (value) => console.error(json(value));
// Network fees on the escrow account are bought with Solana USDC when the balance runs low.
const MIN_ESCROW_GAS = parseEther("0.00002");
const ESCROW_GAS_TOPUP = parseEther("0.00005");
const MIN_SOL_LAMPORTS = 2_000_000n;

function escrowRpcUrl() {
  return process.env.PAYHUMANS_ESCROW_RPC_URL || "https://mainnet.base.org";
}
function client(account) {
  const rpcUrl = escrowRpcUrl();
  const walletClient = createWalletClient({
    account: account ?? "0x0000000000000000000000000000000000000001",
    chain: base,
    transport: http(rpcUrl),
  });
  return new Zkp2pClient({
    walletClient,
    rpcUrl,
    chainId: ESCROW_CHAIN_ID,
    runtimeEnv: "production",
    baseApiUrl: "https://api.zkp2p.xyz",
  });
}
function signer() {
  const keypair = loadSolanaKeypair();
  const account = escrowAccount(keypair);
  return { keypair, account, c: client(account), connection: solanaConnection() };
}
async function receipt(c, hash) {
  const r = await c.publicClient.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`Transaction reverted: ${hash}`);
  return { transactionHash: hash, blockNumber: r.blockNumber, gasUsed: r.gasUsed };
}
async function preflight(c) {
  if ((await c.publicClient.getChainId()) !== ESCROW_CHAIN_ID)
    throw new Error("Escrow RPC points at the wrong network.");
  const account = c.walletClient.account.address;
  const [latest, pending] = await Promise.all(
    ["latest", "pending"].map((blockTag) =>
      c.publicClient.getTransactionCount({ address: account, blockTag }),
    ),
  );
  if (pending !== latest)
    throw new Error("Escrow account has pending transactions. Wait before retrying.");
}
async function escrowBalances(c, address) {
  const [usdc, gas] = await Promise.all([
    c.publicClient.readContract({ address: ESCROW_USDC, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
    c.publicClient.getBalance({ address }),
  ]);
  return { usdc, gas };
}
// Read the USDC credited by a mined transaction from its logs; balance reads can lag the receipt.
async function usdcReceived(c, hash, to) {
  const r = await c.publicClient.getTransactionReceipt({ hash });
  return parseEventLogs({ abi: erc20Abi, logs: r.logs, eventName: "Transfer", strict: false })
    .filter((e) => e.address.toLowerCase() === ESCROW_USDC.toLowerCase() && e.args.to?.toLowerCase() === to.toLowerCase())
    .reduce((sum, e) => sum + e.args.value, 0n);
}
async function returnToSolana(c, keypair, account, amount) {
  const cash = await cashClient();
  const quote = await quoteEscrowToSolana(account.address, keypair.publicKey.toBase58(), amount);
  const summary = quoteSummary(quote);
  log({ stage: "returning-to-solana", ...summary });
  await executeFromEscrow(quote, c.walletClient);
  const status = await waitForRelay(cash, summary.requestId);
  return { ...summary, solanaTxs: status.txHashes };
}
const escrowAddress = (c) => c.getDeployedAddresses().escrowV2 ?? c.getDeployedAddresses().escrow;
// Retries pre-broadcast simulation failures caused by RPC nodes lagging behind a just-mined block.
async function retry(fn, tries = 8) {
  let error;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      error = e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw error;
}
// Protected deposits require claimants to lock stake; PayHumans opens claims to any signed-in human.
async function openClaims(c, id, platform) {
  const escrow = escrowAddress(c);
  const paymentMethod = getPaymentMethodsCatalog(ESCROW_CHAIN_ID, "production")[platform]?.paymentMethodHash;
  if (!paymentMethod) throw new Error("Unsupported platform. Run payhumans platforms.");
  if (!(await retry(() => c.isDisputeProtectionEnabled(escrow, id, paymentMethod)))) return "not enabled";
  const hash = await retry(() => c.setDisputeProtectionEnabled({ escrow, depositId: id, paymentMethod, enabled: false }));
  await receipt(c, hash);
  return "disabled";
}

const program = new Command()
  .name("payhumans")
  .description("Fund verified fiat payment requests with Solana USDC. Writes preview by default.")
  .version("0.2.0");

program
  .command("platforms")
  .description("List supported deposit platforms and currencies")
  .action(() => output({ asset: "Solana USDC", platforms: platforms() }));

program
  .command("wallet")
  .description("Show the agent's Solana wallet and its PayHumans escrow account")
  .action(async () => {
    const { keypair, account, c, connection } = signer();
    const [sol, escrow] = await Promise.all([
      solanaBalances(connection, keypair.publicKey),
      escrowBalances(c, account.address),
    ]);
    output({
      solana: {
        address: keypair.publicKey.toBase58(),
        usdc: formatUnits(sol.usdc, 6),
        sol: formatUnits(sol.lamports, 9),
      },
      escrowAccount: {
        address: account.address,
        usdc: formatUnits(escrow.usdc, 6),
        networkFeeBalance: formatEther(escrow.gas),
        note: "Derived from your Solana key. It owns your deposits; withdrawals return to Solana.",
      },
    });
  });

program
  .command("return")
  .description("Send USDC sitting in your escrow account back to your Solana wallet")
  .option("--amount <usdc>", "USDC to return (defaults to the full balance)")
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const { keypair, account, c } = signer();
    const balance = (await escrowBalances(c, account.address)).usdc;
    const amount = opts.amount ? decimal(opts.amount, "amount") : balance;
    if (amount <= 0n || amount > balance) throw new Error(`Escrow account holds ${formatUnits(balance, 6)} USDC.`);
    if (!opts.yes) {
      output({ mode: "preview", amount: formatUnits(amount, 6), to: keypair.publicKey.toBase58(), quote: quoteSummary(await quoteEscrowToSolana(account.address, keypair.publicKey.toBase58(), amount)) });
      return;
    }
    await preflight(c);
    output({ returned: formatUnits(amount, 6), route: await returnToSolana(c, keypair, account, amount) });
  });

const deposits = program
  .command("deposit")
  .description("Create and manage payment-request deposits");

deposits
  .command("create")
  .description("Preview a deposit; --yes funds it from Solana USDC and creates it")
  .requiredOption("--platform <name>", "Payment platform")
  .requiredOption("--recipient <id>", "Recipient identifier accepted by the payment platform")
  .requiredOption("--amount <usdc>", "USDC to escrow")
  .requiredOption("--currency <code>", "Fiat currency")
  .requiredOption("--rate <fiat-per-usdc>", "Fiat units the human sends per USDC received")
  .option("--min <usdc>", "Minimum claim size (defaults to entire deposit)")
  .option("--max <usdc>", "Maximum claim size (defaults to entire deposit)")
  .option("--max-spend <usdc>", "Reject if total Solana USDC spent (deposit + route fees) would exceed this")
  .option("--require-stake", "Keep dispute protection on; claimants must post stake to claim")
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const p = validateCreate(opts);
    const preview = {
      mode: opts.yes ? "execute" : "preview",
      asset: "Solana USDC",
      platform: p.platform,
      recipient: p.recipient,
      amount: formatUnits(p.amount, 6),
      currency: p.currency,
      fiatPerUsdc: formatUnits(p.rate, 18),
      minimumClaim: formatUnits(p.min, 6),
      maximumClaim: formatUnits(p.max, 6),
      openToAllClaimants: !opts.requireStake,
      note: "Your Solana USDC funds a Peer escrow. A human sends fiat to this recipient and receives the USDC after proof verification. Route fees are paid in Solana USDC; Solana network fees in SOL.",
    };
    const keypair = loadSolanaKeypair({ required: !!opts.yes });
    if (!opts.yes && !keypair) {
      output({ ...preview, next: "Set PAYHUMANS_SOLANA_KEY to see the funding quote, then repeat with --yes." });
      return;
    }
    const account = escrowAccount(keypair);
    const c = client(account);
    const connection = solanaConnection();
    const cash = await cashClient();
    await preflight(c);
    const [sol, escrow] = await Promise.all([
      solanaBalances(connection, keypair.publicKey),
      escrowBalances(c, account.address),
    ]);
    const bridgeAmount = p.amount > escrow.usdc ? p.amount - escrow.usdc : 0n;
    const needsGas = escrow.gas < MIN_ESCROW_GAS;
    const fundingQuote = bridgeAmount > 0n
      ? await quoteSolanaUsdcToEscrow(cash, keypair, account.address, bridgeAmount)
      : null;
    const gasQuote = needsGas ? await quoteEscrowGas(keypair, account.address, ESCROW_GAS_TOPUP) : null;
    const gasInput = gasQuote ? BigInt(gasQuote.details.currencyIn.amount) : 0n;
    const totalSolanaUsdc = (fundingQuote?.inputAmount ?? 0n) + gasInput;
    const plan = {
      ...preview,
      solanaWallet: keypair.publicKey.toBase58(),
      escrowAccount: account.address,
      solanaUsdcToSpend: formatUnits(totalSolanaUsdc, 6),
      solanaUsdcBalance: formatUnits(sol.usdc, 6),
      solBalance: formatUnits(sol.lamports, 9),
      funding: fundingQuote ? quoteSummary(fundingQuote.raw) : "escrow account already holds the USDC",
      networkFeeTopUp: gasQuote ? quoteSummary(gasQuote) : null,
    };
    if (opts.maxSpend && totalSolanaUsdc > decimal(opts.maxSpend, "max-spend"))
      throw new Error(`Total Solana USDC ${formatUnits(totalSolanaUsdc, 6)} exceeds --max-spend.`);
    if (!opts.yes) {
      output({ ...plan, next: "Review these details, then repeat with --yes to fund and create the deposit." });
      return;
    }
    if (sol.usdc < totalSolanaUsdc) throw new Error("Insufficient Solana USDC for this deposit and its route fees.");
    if (totalSolanaUsdc > 0n && sol.lamports < MIN_SOL_LAMPORTS)
      throw new Error("Keep at least 0.002 SOL for Solana network fees.");

    let gasRoute = null;
    if (gasQuote) {
      const requestId = quoteSummary(gasQuote).requestId;
      log({ stage: "network-fee-top-up", requestId });
      const signatures = await executeFromSolana(gasQuote, keypair, connection, log);
      await waitForRelay(cash, requestId);
      gasRoute = { requestId, solanaSignatures: signatures };
    }
    let fundingRoute = null;
    if (fundingQuote) {
      // Quotes are short-lived; refresh right before signing.
      const fresh = await quoteSolanaUsdcToEscrow(cash, keypair, account.address, bridgeAmount);
      log({ stage: "funding-from-solana", requestId: fresh.requestId, ...quoteSummary(fresh.raw) });
      const signatures = await executeFromSolana(fresh.raw, keypair, connection, log);
      const status = await waitForRelay(cash, fresh.requestId);
      fundingRoute = { requestId: fresh.requestId, solanaSignatures: signatures, escrowTxs: status.txHashes };
    }
    const funded = await escrowBalances(c, account.address);
    if (funded.usdc < p.amount) throw new Error("Escrow account USDC did not arrive. Check the Relay request before retrying.");

    const params = {
      token: ESCROW_USDC,
      amount: p.amount,
      intentAmountRange: { min: p.min, max: p.max },
      processorNames: [p.platform],
      payeeData: [{ offchainId: p.recipient }],
      conversionRates: [[{ currency: p.currency, conversionRate: p.rate.toString() }]],
    };
    // Resolve and validate the recipient before approving funds. Send the exact prepared calldata once.
    const prepared = await c.prepareCreateDeposit(params);
    const spender = escrowAddress(c);
    const { to, data, value } = prepared.prepared;
    if (to.toLowerCase() !== spender.toLowerCase() || (value ?? 0n) !== 0n)
      throw new Error("Unexpected deposit contract or value.");
    const approval = await c.ensureAllowance({ token: ESCROW_USDC, spender, amount: p.amount, maxApprove: false });
    if (approval.hash) {
      await receipt(c, approval.hash);
      // Load-balanced RPCs can serve a stale allowance right after the approval lands.
      for (let i = 0; i < 20; i++) {
        const allowance = await c.publicClient.readContract({ address: ESCROW_USDC, abi: erc20Abi, functionName: "allowance", args: [account.address, spender] });
        if (allowance >= p.amount) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    await c.publicClient.call({ account, to, data, value: 0n });
    const hash = await c.walletClient.sendTransaction({ to, data, value: 0n });
    log({ stage: "deposit-submitted", transactionHash: hash });
    const confirmed = await receipt(c, hash);
    const logs = await c.publicClient.getTransactionReceipt({ hash });
    const abi = getContracts(ESCROW_CHAIN_ID, "production").abis.escrowV2 ?? getContracts(ESCROW_CHAIN_ID, "production").abis.escrow;
    const id = parseEventLogs({ abi, logs: logs.logs, strict: false }).find((e) => e.eventName === "DepositReceived")?.args?.depositId;

    let disputeProtection = "unchanged";
    if (id !== undefined && !opts.requireStake) {
      try {
        disputeProtection = await openClaims(c, id, p.platform);
      } catch (error) {
        disputeProtection = `still enabled; run payhumans deposit open-claims --id ${id} --platform ${p.platform} --yes (${safeError(error)})`;
      }
    }
    output({
      ...plan,
      gasRoute,
      fundingRoute,
      ...confirmed,
      depositId: id?.toString() ?? null,
      disputeProtection,
      claimUrl: id !== undefined ? `https://payhumans.ai/earn?deposit=${id}` : null,
    });
  });

deposits
  .command("open-claims")
  .description("Let any signed-in human claim a deposit without posting stake (turns off dispute protection)")
  .requiredOption("--id <id>", "Deposit ID")
  .requiredOption("--platform <name>", "Payment platform of the deposit")
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const id = depositId(opts.id);
    const platform = opts.platform.toLowerCase();
    if (!opts.yes) {
      output({ mode: "preview", depositId: id, platform, note: "Disables dispute protection so claimants need no stake. The agent accepts payment-reversal risk." });
      return;
    }
    const { account, c } = signer();
    await preflight(c);
    const d = await c.getDeposit(id);
    if (d.deposit.depositor.toLowerCase() !== account.address.toLowerCase())
      throw new Error("Your escrow account does not own this deposit.");
    output({ depositId: id, platform, disputeProtection: await openClaims(c, id, platform) });
  });

deposits
  .command("show")
  .argument("<id>", "Deposit ID")
  .action(async (id) => output(await client().getDeposit(depositId(id))));

deposits
  .command("list")
  .option("--owner <address>", "Escrow account (defaults to the one derived from your Solana key)")
  .action(async (opts) => {
    const owner = opts.owner ?? escrowAccount(loadSolanaKeypair()).address;
    if (!isAddress(owner)) throw new Error("Invalid owner address.");
    output(await client().getAccountDeposits(owner));
  });

deposits
  .command("withdraw")
  .description("Withdraw unclaimed USDC and return it to your Solana wallet")
  .requiredOption("--id <id>", "Deposit ID")
  .option("--amount <usdc>", "Available USDC to withdraw (defaults to closing the deposit)")
  .option("--keep-in-escrow-account", "Leave withdrawn USDC in the escrow account for the next deposit")
  .option("--yes", "Sign and broadcast")
  .action(async (opts) => {
    const id = depositId(opts.id);
    const amount = opts.amount ? decimal(opts.amount, "amount") : null;
    if (!opts.yes) {
      output({
        mode: "preview",
        depositId: id,
        amount: amount ? formatUnits(amount, 6) : "all available",
        returnTo: opts.keepInEscrowAccount ? "escrow account" : "Solana wallet",
        note: "Withdraw available funds to the deposit owner. Reserved funds cannot be withdrawn.",
      });
      return;
    }
    const { keypair, account, c } = signer();
    await preflight(c);
    const d = await c.getDeposit(id);
    if (d.deposit.depositor.toLowerCase() !== account.address.toLowerCase())
      throw new Error("Your escrow account does not own this deposit.");
    if (amount && d.availableLiquidity < amount)
      throw new Error("Insufficient available liquidity; claimed funds are reserved.");
    const hash = amount
      ? await c.removeFunds({ depositId: id, amount })
      : await c.withdrawDeposit({ depositId: id });
    log({ stage: "withdraw-submitted", transactionHash: hash });
    const withdrawn = await receipt(c, hash);
    const released = await usdcReceived(c, hash, account.address);
    const returnRoute =
      !opts.keepInEscrowAccount && released > 0n
        ? await retry(() => returnToSolana(c, keypair, account, released), 3)
        : null;
    output({ ...withdrawn, released: formatUnits(released, 6), returnRoute });
  });

program.parseAsync().catch((error) => {
  console.error(json({ error: safeError(error) }));
  process.exitCode = 1;
});
