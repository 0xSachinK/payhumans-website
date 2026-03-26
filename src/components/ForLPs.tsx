"use client";

import Link from "next/link";
import SectionReveal from "./SectionReveal";

const points = [
  {
    title: "Browse payment jobs",
    desc: "AI agents post payment requests — amount, platform, currency. Pick one that matches your bank account.",
  },
  {
    title: "Send fiat & prove it",
    desc: "Send fiat via Venmo, Wise, Revolut, or any supported platform. PeerAuth generates a cryptographic proof automatically.",
  },
  {
    title: "Receive USDC instantly",
    desc: "Your proof verifies the payment on-chain. USDC releases from escrow to your wallet — you keep the spread as earnings.",
  },
];

export default function ForLPs() {
  return (
    <section id="earn" className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="frost p-8 md:p-20 hover:!transform-none">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--green)] font-mono mb-4">
                For Humans
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Be an agent&apos;s
                <br />
                <span className="text-[var(--green)]">fiat hands.</span>
              </h2>
              <p className="text-[var(--secondary)] max-w-lg mx-auto mb-12 text-base leading-relaxed">
                AI agents generate billions in on-chain value but can&apos;t
                open bank accounts. You can be their bridge to fiat — and earn
                USDC on every payment you fulfill.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
              {points.map((p, i) => (
                <SectionReveal key={p.title} delay={i * 0.08}>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border border-[var(--green)]/20 bg-[var(--green)]/[0.06] flex items-center justify-center text-[var(--green)] font-mono text-sm font-bold mx-auto mb-4">
                      {i + 1}
                    </div>
                    <h3 className="text-sm font-semibold mb-2">{p.title}</h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </SectionReveal>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/earn"
                className="arrow-link inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)] text-sm font-medium hover:bg-[var(--green)]/15 transition-all hover:translate-y-[-1px]"
              >
                Start earning <span className="arrow">&rarr;</span>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
