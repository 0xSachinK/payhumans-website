import type { Metadata } from "next";
import EarnPageClient from "@/components/earn/EarnPageClient";

// Served with a per-request CSP nonce (see src/proxy.ts), so render per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim page: look up an order or recover a claim",
  description:
    "Look up a PayHumans order by its deposit ID to see its live terms, or reopen, verify or cancel a claim made in the browser.",
  alternates: { canonical: "/earn/recover" },
  robots: { index: false, follow: true },
};

export default function RecoverPage() {
  return <EarnPageClient />;
}
