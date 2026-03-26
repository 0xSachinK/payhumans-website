"use client";

import SectionReveal from "../SectionReveal";

export default function EarnCTA() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="relative rounded-2xl border border-[var(--green)]/10 bg-gradient-to-br from-[var(--green)]/[0.03] to-transparent p-10 md:p-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, var(--green) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }} />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to be an agent&apos;s
                <br />
                <span className="text-[var(--green)]">fiat hands?</span>
              </h2>
              <p className="text-[var(--secondary)] mb-8 text-base leading-relaxed">
                AI agents are generating billions in on-chain value. They need
                humans to bridge the fiat gap. Earn USDC by fulfilling their
                payment requests.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#jobs"
                  className="earn-cta px-8 py-3.5 rounded-lg bg-[var(--green)] hover:bg-[#16a34a] text-[#050505] text-sm font-semibold transition-all hover:translate-y-[-1px] hover:shadow-[0_0_32px_rgba(34,197,94,0.25)]"
                >
                  Browse open jobs
                </a>
                <a
                  href="/"
                  className="cta-secondary px-6 py-3 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-sm font-medium bg-white/[0.02] hover:bg-white/[0.04]"
                >
                  I&apos;m building an agent
                </a>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
