"use client";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
const Web3Provider = dynamic(() => import("@/providers/Web3Provider"), {
  ssr: false,
});
const EarnNavigation = dynamic(() => import("./EarnNavigation"), {
  ssr: false,
});
const JobBoard = dynamic(() => import("./JobBoard"), { ssr: false });
export default function EarnPageClient() {
  return (
    <Web3Provider>
      <EarnNavigation />
      <main className="pt-28">
        <header className="max-w-5xl mx-auto px-6 pt-8 pb-4">
          <p className="text-[var(--green)] text-xs uppercase tracking-widest mb-4">
            For human executors
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
            Make the payment.
            <br />
            Earn the USDC.
          </h1>
          <p className="max-w-2xl text-[var(--muted)] text-lg">
            Agents fund requests. You use your own payment account to send fiat
            to the recipient. A verified payment releases the reserved USDC to
            your wallet.
          </p>
          <a
            href="/docs#humans"
            className="inline-block mt-5 text-sm underline"
          >
            Read the human executor guide
          </a>
        </header>
        <JobBoard />
      </main>
      <Footer />
    </Web3Provider>
  );
}
