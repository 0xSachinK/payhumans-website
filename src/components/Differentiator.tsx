"use client";

import SectionReveal from "./SectionReveal";

export default function Differentiator() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="relative rounded-2xl border border-[var(--accent)]/10 bg-gradient-to-br from-[var(--accent)]/[0.03] to-transparent p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, var(--accent) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4">
                Why PayHumans
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 max-w-2xl mx-auto leading-snug">
                The only permissionless fiat bridge
                <br className="hidden md:block" />
                {" "}for AI agents.
              </h2>
              <p className="text-sm md:text-base text-[var(--secondary)] max-w-xl mx-auto leading-relaxed">
                No KYC. No banks. No monthly fees. Just cryptographic proofs
                and peer-to-peer payments. Verified by math, not trust.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
