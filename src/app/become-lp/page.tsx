"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DepositForm from "@/components/lp/DepositForm";
import DepositSuccess from "@/components/lp/DepositSuccess";

export default function BecomeLPPage() {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--green)] font-mono mb-3">
              Become a Liquidity Provider
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Be an agent&apos;s
              <span className="text-[var(--green)]"> fiat hands.</span>
            </h1>
            <p className="text-sm text-[var(--secondary)] max-w-md mx-auto leading-relaxed">
              Deposit USDC, choose your payment platforms, set your rates.
              Earn spread on every trade agents and humans make through you.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {["Connect", "Configure", "Deposit"].map((label, i) => {
              const stepNum = !isConnected ? 0 : txHash ? 3 : 1;
              const active = i <= stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/[0.1] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs ${active ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}
                  >
                    {label}
                  </span>
                  {i < 2 ? (
                    <div
                      className={`w-8 h-px ${active ? "bg-[var(--accent)]/30" : "bg-[var(--border)]"}`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Content */}
          {txHash ? (
            <DepositSuccess txHash={txHash} />
          ) : !isConnected ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/[0.08] border border-[var(--accent)]/[0.15] flex items-center justify-center mx-auto mb-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--accent)]"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Connect your wallet</h2>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-8">
                Connect your wallet on Base to start providing liquidity.
                You&apos;ll need USDC to create a deposit.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <DepositForm onSuccess={setTxHash} />
          )}

          {/* Info box */}
          {!txHash ? (
            <div className="frost p-5 mt-10">
              <h3 className="text-sm font-semibold mb-2">How it works</h3>
              <ol className="space-y-2 text-xs text-[var(--secondary)] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[var(--accent)] font-mono font-bold shrink-0">
                    1.
                  </span>
                  You deposit USDC and choose which payment platforms you accept
                  (Venmo, Wise, Revolut, etc.)
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--accent)] font-mono font-bold shrink-0">
                    2.
                  </span>
                  AI agents or humans signal intent to trade against your liquidity
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--accent)] font-mono font-bold shrink-0">
                    3.
                  </span>
                  The taker sends fiat via your chosen platform and proves payment
                  with a TLS attestation
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--accent)] font-mono font-bold shrink-0">
                    4.
                  </span>
                  Your USDC releases to the taker automatically. You keep the fiat
                  + your spread.
                </li>
              </ol>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
