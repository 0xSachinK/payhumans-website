import fs from "node:fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createClient, MAINNET_RELAY_API } from "@relayprotocol/relay-sdk";
import { configureDynamicChains } from "@relayprotocol/relay-sdk/chain-utils";
import { concat, keccak256, nonceManager, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const SOLANA_CHAIN_ID = 792703809;
export const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const ESCROW_CHAIN_ID = 8453;
export const ESCROW_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const ESCROW_ACCOUNT_DOMAIN = "payhumans.ai/escrow-account/v1";
const TERMINAL = new Set(["success", "failure", "refund"]);

export function solanaRpcUrl() {
  return process.env.PAYHUMANS_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

export function solanaConnection() {
  return new Connection(solanaRpcUrl(), "confirmed");
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Decode(value) {
  let n = 0n;
  for (const c of value) {
    const i = B58.indexOf(c);
    if (i < 0) throw new Error("Solana key is not valid base58.");
    n = n * 58n + BigInt(i);
  }
  const bytes = [];
  while (n > 0n) {
    bytes.unshift(Number(n & 0xffn));
    n >>= 8n;
  }
  for (const c of value) {
    if (c !== "1") break;
    bytes.unshift(0);
  }
  return Uint8Array.from(bytes);
}

// Accepts a base58 secret, a Solana CLI JSON array, or a {"secretKey": [...]} record.
export function loadSolanaKeypair({ required = true } = {}) {
  const file = process.env.PAYHUMANS_SOLANA_KEY_FILE;
  let raw = process.env.PAYHUMANS_SOLANA_KEY;
  if (!raw && file) raw = fs.readFileSync(file, "utf8");
  if (!raw) {
    if (!required) return null;
    throw new Error(
      "Set PAYHUMANS_SOLANA_KEY (base58 or JSON array) or PAYHUMANS_SOLANA_KEY_FILE in your secret environment. Never put a key in a command argument.",
    );
  }
  raw = raw.trim();
  let bytes;
  try {
    if (raw.startsWith("[")) bytes = Uint8Array.from(JSON.parse(raw));
    else if (raw.startsWith("{")) bytes = Uint8Array.from(JSON.parse(raw).secretKey ?? []);
    else bytes = base58Decode(raw);
  } catch { throw new Error("Solana signing key has an invalid base58/JSON format."); }
  if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  if (bytes.length === 32) return Keypair.fromSeed(bytes);
  throw new Error("Solana key must be a 64-byte secret key or a 32-byte seed.");
}

// The Peer escrow account is derived from the Solana key, so an agent manages one secret.
export function escrowAccount(keypair) {
  const key = keccak256(concat([toBytes(ESCROW_ACCOUNT_DOMAIN), keypair.secretKey.slice(0, 32)]));
  return privateKeyToAccount(key, { nonceManager });
}

export async function solanaBalances(connection, owner) {
  const [lamports, tokens] = await Promise.all([
    connection.getBalance(owner, "confirmed"),
    connection.getParsedTokenAccountsByOwner(owner, { mint: new PublicKey(SOLANA_USDC) }, "confirmed"),
  ]);
  const usdc = tokens.value.reduce(
    (sum, a) => sum + BigInt(a.account.data.parsed.info.tokenAmount.amount),
    0n,
  );
  return { lamports: BigInt(lamports), usdc };
}

let relay;
export async function relayClient() {
  if (relay) return relay;
  const apiKey = process.env.PAYHUMANS_RELAY_API_KEY;
  // Without an API key, omit the referrer: Relay rejects keyless quotes that carry one.
  relay = createClient({
    baseApiUrl: MAINNET_RELAY_API,
    ...(apiKey ? { apiKey, source: "payhumans.ai" } : {}),
  });
  relay.chains = await configureDynamicChains();
  return relay;
}

export function quoteSummary(raw) {
  const d = raw?.details ?? {};
  return {
    requestId: raw?.steps?.find((s) => s.requestId)?.requestId ?? null,
    pay: d.currencyIn ? `${d.currencyIn.amountFormatted} ${d.currencyIn.currency?.symbol}` : null,
    receive: d.currencyOut ? `${d.currencyOut.amountFormatted} ${d.currencyOut.currency?.symbol}` : null,
    feesUsd: raw?.fees
      ? Object.fromEntries(Object.entries(raw.fees).map(([k, v]) => [k, v?.amountUsd ?? null]))
      : null,
    etaSeconds: d.timeEstimate ?? null,
  };
}

export async function waitForRelay(cash, requestId, { timeoutMs = 300_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let status;
  while (Date.now() < deadline) {
    try {
      status = await cash.relayStatus(requestId);
      if (TERMINAL.has(status.status)) break;
    } catch {
      // Status may 404 briefly before Relay indexes the deposit.
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  if (status?.status !== "success")
    throw new Error(`Relay request ${requestId} did not succeed (status: ${status?.status ?? "unknown"}).`);
  return status;
}
