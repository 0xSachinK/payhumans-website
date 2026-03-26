"use client";

import SectionReveal from "./SectionReveal";
import { LINKS } from "@/lib/constants";

const points = [
  {
    title: "Deposit USDC",
    desc: "Provide liquidity to the protocol. Set your accepted payment platforms and currencies.",
  },
  {
    title: "Set your rates",
    desc: "Choose your spread. Automate with Delegated Rate Management or the Peer CLI.",
  },
  {
    title: "Earn on every trade",
    desc: "When agents or humans take your liquidity, you earn the spread. Funds settle automatically.",
  },
];

export default function ForLPs() {
  return (
    <section id="earn" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="frost p-10 md:p-20">
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
                As AI agents grow, they&apos;ll need billions in fiat access.
                You can be the bridge. Deposit USDC, accept fiat payments,
                earn spread on every trade.
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
              <a
                href={LINKS.app}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 text-[var(--green)] text-sm font-medium hover:bg-[var(--green)]/15 transition-colors"
              >
                Start providing liquidity &rarr;
              </a>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
