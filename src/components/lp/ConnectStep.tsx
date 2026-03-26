"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function ConnectStep({ onConnected }: { onConnected: () => void }) {
  const { isConnected } = useAccount();

  if (isConnected) {
    onConnected();
    return null;
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/[0.08] border border-[var(--accent)]/[0.15] flex items-center justify-center text-2xl mx-auto mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17,21 17,13 7,13 7,21" />
          <polyline points="7,3 7,8 15,8" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3">Connect your wallet</h2>
      <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-8">
        Connect your wallet to start providing liquidity. You&apos;ll deposit
        USDC and earn spread on every trade.
      </p>
      <ConnectButton />
    </div>
  );
}
