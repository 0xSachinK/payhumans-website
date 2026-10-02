import { getPaymentMethodsCatalog, getCurrencyCodeFromHash } from "@zkp2p/sdk";
import { parseUnits } from "viem";

export function decimal(value, name, precision = 6) {
  if (
    typeof value !== "string" ||
    !new RegExp(`^\\d+(?:\\.\\d{1,${precision}})?$`).test(value)
  )
    throw new Error(
      `${name} must be a positive decimal with at most ${precision} decimal places.`,
    );
  const amount = parseUnits(value, precision);
  if (amount <= 0n) throw new Error(`${name} must be greater than zero.`);
  return amount;
}
export function platforms() {
  return Object.entries(getPaymentMethodsCatalog(8453, "production")).map(
    ([platform, config]) => ({
      platform,
      currencies: (config.currencies ?? [])
        .map((hash) => getCurrencyCodeFromHash(hash))
        .filter(Boolean),
      note:
        platform === "wise"
          ? "A verified recipient identity attestation may be required."
          : "Recipient and platform validation applies at creation.",
    }),
  );
}
export function validateCreate(input) {
  const platform = input.platform.toLowerCase();
  const currency = input.currency.toUpperCase();
  const config = platforms().find((p) => p.platform === platform);
  if (!config)
    throw new Error("Unsupported platform. Run payhumans platforms.");
  if (!config.currencies.includes(currency))
    throw new Error(
      `${platform} does not support ${currency}. Run payhumans platforms.`,
    );
  const recipient = input.recipient.trim();
  if (!recipient || recipient.length > 256 || /[\x00-\x1f]/.test(recipient))
    throw new Error("A valid recipient payment identifier is required.");
  const amount = decimal(input.amount, "amount");
  const min = decimal(input.min ?? input.amount, "min");
  const max = decimal(input.max ?? input.amount, "max");
  if (min > max || max > amount)
    throw new Error("Require 0 < min <= max <= amount.");
  const rate = decimal(input.rate, "rate", 18);
  if (input.maxSpend && amount > decimal(input.maxSpend, "max-spend"))
    throw new Error("Deposit exceeds --max-spend.");
  return { platform, currency, recipient, amount, min, max, rate };
}
export function depositId(value) {
  if (!/^\d+$/.test(value))
    throw new Error("Deposit ID must be a non-negative integer.");
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
  for (const secret of [
    process.env.PAYHUMANS_SOLANA_KEY,
    process.env.PAYHUMANS_RELAY_API_KEY,
  ])
    if (secret) message = message.split(secret).join("[REDACTED]");
  return message.replace(/0x[a-fA-F0-9]{64}/g, "[hash]").slice(0, 1800);
}
