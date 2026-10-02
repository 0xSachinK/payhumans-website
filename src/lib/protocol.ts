import {
  Zkp2pClient,
  getPaymentMethodsCatalog,
  getCurrencyCodeFromHash,
  setLogLevel,
} from "@zkp2p/sdk";
import { createWalletClient, http, type Address, formatUnits } from "viem";
import { base } from "viem/chains";

setLogLevel("error");
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const CHAIN_ID = 8453;
export function protocolClient(
  account: Address = "0x0000000000000000000000000000000000000001",
) {
  const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
  return new Zkp2pClient({
    walletClient,
    chainId: CHAIN_ID,
    runtimeEnv: "production",
    baseApiUrl: "https://api.zkp2p.xyz",
    rpcUrl,
  });
}
export interface LiveJob {
  id: string;
  depositId: string;
  owner: string;
  platform: string;
  currency: string;
  available: string;
  min: string;
  max: string;
  rate: string;
  rateRaw: string;
  payeeHash: string;
  recipient: string;
  accepting: boolean;
}
export function validId(id: string) {
  return /^\d{1,20}$/.test(id);
}
export async function getJobs(id: string): Promise<LiveJob[]> {
  if (!validId(id)) throw new Error("Enter a valid numeric deposit ID.");
  const client = protocolClient();
  const view = await client.getDeposit(BigInt(id));
  if (view.deposit.token.toLowerCase() !== USDC.toLowerCase())
    throw new Error("This request does not use USDC.");
  const catalog = getPaymentMethodsCatalog(CHAIN_ID, "production");
  const jobs: LiveJob[] = [];
  for (const method of view.paymentMethods) {
    const platform = Object.entries(catalog).find(
      ([, v]) =>
        v.paymentMethodHash.toLowerCase() ===
        method.paymentMethod.toLowerCase(),
    )?.[0];
    if (!platform) continue;
    const result = await fetch(
      `https://api.zkp2p.xyz/v2/makers/${encodeURIComponent(platform)}/${encodeURIComponent(method.verificationData.payeeDetails)}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) },
    );
    if (!result.ok)
      throw new Error(
        "Recipient details are temporarily unavailable. Try again before claiming.",
      );
    const payee = await result.json();
    const recipient = payee.responseObject?.offchainId;
    if (
      !recipient ||
      payee.responseObject?.hashedOnchainId?.toLowerCase() !==
        method.verificationData.payeeDetails.toLowerCase()
    )
      throw new Error(
        "Recipient details could not be verified against escrow.",
      );
    for (const c of method.currencies) {
      const currency = getCurrencyCodeFromHash(c.code as `0x${string}`);
      if (!currency || c.minConversionRate <= 0n) continue;
      const max =
        view.availableLiquidity < view.deposit.intentAmountRange.max
          ? view.availableLiquidity
          : view.deposit.intentAmountRange.max;
      jobs.push({
        id: `${id}-${platform}-${currency}`,
        depositId: id,
        owner: view.deposit.depositor,
        platform,
        currency,
        available: formatUnits(view.availableLiquidity, 6),
        min: formatUnits(view.deposit.intentAmountRange.min, 6),
        max: formatUnits(max, 6),
        rate: formatUnits(c.minConversionRate, 18),
        rateRaw: c.minConversionRate.toString(),
        payeeHash: method.verificationData.payeeDetails,
        recipient,
        accepting:
          view.deposit.acceptingIntents &&
          max >= view.deposit.intentAmountRange.min,
      });
    }
  }
  return jobs;
}
export function errorMessage(error: unknown) {
  const e = error as { shortMessage?: string; message?: string };
  return (
    e.shortMessage ||
    e.message ||
    "Unable to complete the request."
  ).slice(0, 600);
}
