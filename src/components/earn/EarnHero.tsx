"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { EARN_STATS } from "@/lib/mock-jobs";

const statItems = [
  { value: EARN_STATS.activeJobs, label: "Active Jobs" },
  { value: EARN_STATS.totalEarned, label: "Paid Out" },
  { value: EARN_STATS.avgCompletion, label: "Avg Completion" },
  { value: EARN_STATS.executors, label: "Executors" },
];

export default function EarnHero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Green gradient orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--green)]/[0.025] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[var(--accent)]/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            {EARN_STATS.activeJobs} payment jobs available now
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[0.92] mb-6"
        >
          Earn crypto by sending
          <br />
          <span className="earn-glow-text text-[var(--green)]">payments for AI agents.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-center text-lg md:text-xl text-[var(--secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          You have a bank account. AI agents don&apos;t.
          <br className="hidden md:block" />
          Get paid to be their fiat hands.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? () => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" }) : openConnectModal}
                  className="earn-cta px-8 py-3.5 rounded-lg bg-[var(--green)] hover:bg-[#16a34a] text-[#050505] text-sm font-semibold transition-all hover:translate-y-[-1px] hover:shadow-[0_0_32px_rgba(34,197,94,0.25)]"
                >
                  {connected ? "Browse Jobs" : "Connect Wallet & Start Earning"}
                </button>
              );
            }}
          </ConnectButton.Custom>
          <a
            href="#how-it-works-earn"
            className="cta-secondary px-6 py-3 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-sm font-medium bg-white/[0.02] hover:bg-white/[0.04]"
          >
            How it works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {statItems.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              className="text-center py-4 px-3 rounded-xl border border-white/[0.04] bg-white/[0.015]"
            >
              <div className="text-xl md:text-2xl font-bold font-mono text-[var(--green)] mb-1">
                {s.value}
              </div>
              <div className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  );
}
