"use client";

import SectionReveal from "./SectionReveal";

const platforms = [
  "Venmo", "PayPal", "CashApp", "Wise", "Revolut", "Zelle",
  "Monzo", "Chime", "N26", "MercadoPago", "Alipay", "IDFC",
  "Luxon", "Mercury", "Interac", "RBC Interac",
];

export default function Stats() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Network
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
            18+ payment platforms.
            <br />
            <span className="text-[var(--muted)]">35+ currencies. One protocol.</span>
          </h2>
        </SectionReveal>

        <SectionReveal>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {platforms.map((p) => (
              <span
                key={p}
                className="px-4 py-2 rounded-full text-sm text-[var(--secondary)] border border-white/[0.06] bg-white/[0.02] hover:border-[var(--accent)]/20 hover:text-[var(--fg)] transition-colors cursor-default"
              >
                {p}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full text-sm text-[var(--accent)] border border-[var(--accent)]/20 bg-[var(--accent)]/[0.05] font-medium">
              + more
            </span>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
