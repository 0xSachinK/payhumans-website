"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";

export default function EarnDashboard() {
  const { isConnected, address } = useAccount();

  if (!isConnected) return null;

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-6 mb-6"
    >
      <div className="p-4 rounded-xl border border-[var(--green)]/10 bg-[var(--green)]/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[var(--green)]">
            Your Earnings
          </span>
          <span className="text-[10px] font-mono text-[var(--muted)]">
            {truncated}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-lg font-bold font-mono text-[var(--green)]">
              $0.00
            </div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
              Total Earned
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono">0</div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
              Jobs Done
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono">--</div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
              Success Rate
            </div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono">0</div>
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
              Day Streak
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
