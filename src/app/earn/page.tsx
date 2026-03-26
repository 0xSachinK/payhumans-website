import EarnPageClient from "@/components/earn/EarnPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn — PayHumans.ai",
  description:
    "Earn crypto by sending fiat payments for AI agents. Browse open payment requests, claim a job, send fiat, prove it, receive USDC.",
  openGraph: {
    title: "Earn crypto by paying for AI agents — PayHumans.ai",
    description:
      "You have a bank account. AI agents don't. Get paid to be their fiat hands. Browse jobs, send fiat, earn USDC.",
  },
};

export default function EarnPage() {
  return <EarnPageClient />;
}
