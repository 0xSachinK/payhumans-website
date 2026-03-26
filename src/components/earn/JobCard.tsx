"use client";

import { motion } from "framer-motion";
import type { PaymentJob } from "@/lib/mock-jobs";

const platformColors: Record<string, string> = {
  Venmo: "#008CFF",
  Wise: "#9FE870",
  Revolut: "#0075EB",
  CashApp: "#00D632",
  PayPal: "#003087",
  Zelle: "#6D1ED4",
  Monzo: "#E73C5E",
  MercadoPago: "#009EE3",
};

export default function JobCard({
  job,
  index,
  onClaim,
}: {
  job: PaymentJob;
  index: number;
  onClaim: (job: PaymentJob) => void;
}) {
  const color = platformColors[job.platform] || "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="job-card group relative rounded-2xl border border-white/[0.05] bg-[#0a0a0f]/80 p-5 hover:border-[var(--green)]/15 transition-all duration-300 hover:bg-[var(--green)]/[0.01]"
    >
      {/* Platform color accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />

      {/* Header: Platform + Currency */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}
          >
            <span style={{ color }}>{job.platformIcon}</span>
          </div>
          <div>
            <div className="text-sm font-semibold">{job.platform}</div>
            <div className="text-[11px] text-[var(--muted)]">{job.currency}</div>
          </div>
        </div>
        <div className="text-[10px] text-[var(--muted)] font-mono">
          {job.createdAt}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="text-2xl font-bold font-mono tracking-tight">
          {job.amount}
          <span className="text-sm font-normal text-[var(--muted)] ml-1.5">
            USDC
          </span>
        </div>
        <div className="text-xs text-[var(--muted)] mt-1">
          Send {job.fiatAmount} {job.currency} via {job.platform}
        </div>
      </div>

      {/* Earnings highlight */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--green)]/[0.04] border border-[var(--green)]/10">
        <div className="flex-1">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-0.5">
            Your Earnings
          </div>
          <div className="text-lg font-bold text-[var(--green)] font-mono">
            {job.earnings}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-0.5">
            Spread
          </div>
          <div className="text-sm font-mono text-[var(--secondary)]">
            {job.spread}
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-5 text-[11px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                job.successRate >= 95
                  ? "var(--green)"
                  : job.successRate >= 90
                    ? "var(--amber)"
                    : "#ef4444",
            }}
          />
          {job.successRate}% success
        </span>
        <span>{job.totalFulfilled} fulfilled</span>
        <span className="font-mono">{job.depositor}</span>
      </div>

      {/* Claim button */}
      <button
        onClick={() => onClaim(job)}
        className="w-full py-2.5 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)] text-sm font-medium hover:bg-[var(--green)]/15 hover:border-[var(--green)]/30 transition-all group-hover:shadow-[0_0_20px_rgba(34,197,94,0.08)]"
      >
        Claim Job
      </button>
    </motion.div>
  );
}
