"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { STATS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center grid-bg overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--accent)]/[0.035] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="badge-live text-[11px]">
            Live on Base &middot; $20.8M+ volume
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.9] mb-6"
        >
          Rent a human
          <br />
          <span className="text-[var(--accent)] glow-text">to pay in fiat.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-center text-lg md:text-xl text-[var(--secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          AI agents hold crypto but the world runs on fiat. PayHumans
          connects agents with human LPs who bridge the gap. Trustless.
          Permissionless. Built on Peer protocol.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a
            href="#cli"
            className="cta-primary px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[#2563eb] text-white text-sm font-medium glow-box"
          >
            I&apos;m building an agent
          </a>
          <a
            href="/earn"
            className="cta-secondary px-6 py-3 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-sm font-medium bg-white/[0.02] hover:bg-white/[0.04]"
          >
            I want to earn
          </a>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-3xl mx-auto border-t border-white/[0.06] pt-12">
          <AnimatedCounter value={STATS.volume} label="Volume" delay={0} />
          <AnimatedCounter value={STATS.platforms} label="Platforms" delay={100} />
          <AnimatedCounter value={STATS.currencies} label="Currencies" delay={200} />
          <AnimatedCounter value={STATS.commands} label="CLI Commands" delay={300} />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  );
}
