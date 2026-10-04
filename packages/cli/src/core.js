import { getPaymentMethodsCatalog, getCurrencyCodeFromHash } from "@zkp2p/sdk";
import { parseUnits } from "viem";
import { createCashClient } from "@zkp2p/cash";

export class InvalidArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidArgumentError";
    this.code = "INVALID_ARGUMENT";
  }
}

export const GAS_PREVIEW_NOTE = "Gas caps are checked against prepared transactions during execution and may stop an action before signing. This preview is not a full transaction gas estimate. Earlier confirmed steps remain spent; resume the same operation ID.";

export function decimal(value, name, precision = 6) {
  if (
    typeof value !== "string" ||
    !new RegExp(`^\\d+(?:\\.\\d{1,${precision}})?$`).test(value)
  )
    throw new InvalidArgumentError(
      `${name} must be a positive decimal with at most ${precision} decimal places.`,
    );
  const amount = parseUnits(value, precision);
  if (amount <= 0n) throw new InvalidArgumentError(`${name} must be greater than zero.`);
  return amount;
}
export function recipientRegistrationUrl(platform) {
  const name = String(platform ?? "").toLowerCase();
  return name === "wise" || name === "paypal"
    ? `https://app.peer.xyz/sell/${name}`
    : "https://app.peer.xyz/sell?tab=advanced";
}
export function platforms() {
  const cashPlatforms = createCashClient({ environment: "production" }).capabilities().platforms;
  // The deployed Curator accepts narrower identifiers than generic SDK hints.
  const recipientHints = { wise: "Wisetag (not an email address)", paypal: "PayPal.me username for a personal account", zelle: "Recipient email address" };
  return Object.entries(getPaymentMethodsCatalog(8453, "production")).map(([platform, config]) => {
    const capability = cashPlatforms.find(p => p.platform === platform || p.id === platform || p.processorName === platform);
    const needsIdentity = capability?.requiresIdentityAttestation ?? ["paypal", "wise", "alipay"].includes(platform);
    return { platform, currencies: (config.currencies ?? []).map(getCurrencyCodeFromHash).filter(Boolean), requiresIdentityAttestation: needsIdentity,
      registrationUrl: recipientRegistrationUrl(platform), recipientHint: recipientHints[platform] ?? capability?.payeeHint ?? "See the platform recipient identifier format in Peer.",
      note: needsIdentity ? `Reuse a registered recipient or complete recipient identity verification with the Peer browser extension at ${recipientRegistrationUrl(platform)}. A bare new handle may fail PAYEE_VERIFICATION_REQUIRED.` : "Register or reuse recipient details with payhumans recipient register. Registration validates format, not ownership; verify recipient identity separately." };
  });
}
export function validateCreate(input) {
  const platform = input.platform.toLowerCase();
  const currency = input.currency.toUpperCase();
  const config = platforms().find((p) => p.platform === platform);
  if (!config)
    throw new InvalidArgumentError("Unsupported platform. Run payhumans platforms.");
  if (!config.currencies.includes(currency))
    throw new InvalidArgumentError(
      `${platform} does not support ${currency}. Run payhumans platforms.`,
    );
  const recipient = input.recipient.trim();
  if (!recipient || recipient.length > 256 || /[\x00-\x1f]/.test(recipient))
    throw new InvalidArgumentError("A valid recipient payment identifier is required.");
  const amount = decimal(input.amount, "amount");
  const min = decimal(input.min ?? (amount < 1_000_000n ? input.amount : "1"), "min");
  const max = decimal(input.max ?? input.amount, "max");
  if (min > max || max > amount)
    throw new InvalidArgumentError("Require 0 < min <= max <= amount.");
  const rate = decimal(input.rate, "rate", 18);
  if (input.maxSpend && amount > decimal(input.maxSpend, "max-spend"))
    throw new InvalidArgumentError("Deposit exceeds --max-spend.");
  return { platform, currency, recipient, amount, min, max, rate };
}
export function depositId(value) {
  if (!/^\d+$/.test(value))
    throw new InvalidArgumentError("Deposit ID must be a non-negative integer.");
  return BigInt(value);
}
export function json(value) {
  return JSON.stringify(
    value,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
}
export function safeError(error) {
  let message = error?.shortMessage || error?.message || "Request failed.";
  let cause = error?.cause;
  for (let i=0; cause && i<3; i++, cause=cause.cause) { if(cause.message && !message.includes(cause.message)) message += ` ${cause.message}`; }
  for (const secret of [
    process.env.PAYHUMANS_SOLANA_KEY,
    process.env.PAYHUMANS_EVM_KEY,
    process.env.PAYHUMANS_PRIVATE_KEY,
    process.env.PAYHUMANS_NEAR_INTENTS_TOKEN,
    process.env.PAYHUMANS_RELAY_API_KEY,
    ...Object.entries(process.env).filter(([name]) => name.startsWith("PAYHUMANS_") && name.includes("RPC")).map(([, value]) => value),
  ])
    if (secret) message = message.split(secret).join("[REDACTED]");
  return message.replace(/0x[a-fA-F0-9]{64}/g, "[hash]").slice(0, 1800);
}

export function errorOutput(error) {
  const message = safeError(error);
  const registration = /PAYEE_VERIFICATION_REQUIRED|identity attestation|verif.*required/i.test(message);
  const throttled = /\b429\b|rate.?limit|too many requests|over.?rate|request limit|compute units.*exceeded/i.test(message) || [429, -32005, "RATE_LIMITED"].includes(error.code);
  return { error: { code: registration ? "RECIPIENT_REGISTRATION_REQUIRED" : error.code || "REQUEST_FAILED", message, ...(registration ? { registrationUrl: recipientRegistrationUrl(), platformRegistrationUrls: { wise: recipientRegistrationUrl("wise"), paypal: recipientRegistrationUrl("paypal") }, next: "The recipient must finish verification at https://app.peer.xyz/sell?tab=advanced (Wise: /sell/wise; PayPal: /sell/paypal), then retry the same operation ID." } : throttled ? { retryable: true, next: "Back off for 15–30 seconds before retrying a read. For Base RPC throttling, configure PAYHUMANS_ESCROW_RPC_URL or PAYHUMANS_RPC_8453. For a source EVM RPC, use PAYHUMANS_RPC_<chainId>; for Solana use PAYHUMANS_SOLANA_RPC_URL. Keep RPC credentials in your secret environment. If execution already started, inspect and resume the same operation ID; do not create a second payment." } : {}) } };
}
