import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "PayHumans.ai",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "placeholder",
  chains: [base],
  ssr: true,
});

export const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as const;
export const USDC_DECIMALS = 6;

export function parseUSDC(amount: string): bigint {
  const [integer, fractional = ""] = amount.split(".");
  const padded = fractional.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(integer + padded);
}

export function formatUSDC(amount: bigint): string {
  const str = amount.toString().padStart(USDC_DECIMALS + 1, "0");
  const integer = str.slice(0, -USDC_DECIMALS);
  const decimal = str.slice(-USDC_DECIMALS).replace(/0+$/, "");
  return decimal ? `${integer}.${decimal}` : integer;
}

export function formatRate(rate: number): string {
  return (BigInt(Math.round(rate * 1e18))).toString();
}

export const SUPPORTED_PLATFORMS = [
  { id: "wise", name: "Wise", fields: ["email"] },
  { id: "venmo", name: "Venmo", fields: ["venmoHandle"] },
  { id: "revolut", name: "Revolut", fields: ["email"] },
  { id: "cashapp", name: "CashApp", fields: ["cashtag"] },
  { id: "paypal", name: "PayPal", fields: ["email"] },
  { id: "zelle", name: "Zelle", fields: ["email"] },
  { id: "monzo", name: "Monzo", fields: ["email"] },
  { id: "chime", name: "Chime", fields: ["email"] },
  { id: "mercadopago", name: "MercadoPago", fields: ["email"] },
  { id: "n26", name: "N26", fields: ["email"] },
] as const;

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "INR", "BRL",
  "MXN", "SGD", "HKD", "KRW", "THB", "PHP", "IDR", "MYR",
] as const;
