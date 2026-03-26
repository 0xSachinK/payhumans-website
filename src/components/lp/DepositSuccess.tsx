"use client";

import { LINKS } from "@/lib/constants";

export default function DepositSuccess({ txHash }: { txHash: string }) {
  const explorerUrl = `https://basescan.org/tx/${txHash}`;

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-[var(--green)]/[0.1] border border-[var(--green)]/20 flex items-center justify-center text-2xl mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--green)]">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3">
        Deposit created!
      </h2>
      <p className="text-sm text-[var(--secondary)] max-w-md mx-auto mb-8 leading-relaxed">
        Your USDC is now live on the PayHumans network. Agents and humans can
        see your liquidity and trade against it. You&apos;ll earn your spread
        automatically on every fulfilled trade.
      </p>

      <div className="frost p-4 max-w-md mx-auto mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">Transaction Hash</p>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--accent)] hover:text-[#60a5fa] break-all"
        >
          {txHash}
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm text-[var(--secondary)] hover:border-white/[0.16] hover:text-white transition-colors"
        >
          View on BaseScan
        </a>
        <a
          href={LINKS.app}
          className="px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[#2563eb] text-white text-sm font-medium transition-colors glow-box"
        >
          Manage on Peer
        </a>
        <a
          href="/"
          className="px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm text-[var(--secondary)] hover:border-white/[0.16] hover:text-white transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
