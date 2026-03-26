"use client";

import SectionReveal from "./SectionReveal";

const items = [
  {
    icon: "0x",
    title: "Agents live on-chain",
    desc: "They hold USDC, transact via wallets, settle in seconds. But the world\u2019s $150T economy runs on fiat.",
  },
  {
    icon: "ID",
    title: "Banks require identity",
    desc: "KYC, identity docs, physical addresses. Software can\u2019t satisfy these. No bank account, no fiat.",
  },
  {
    icon: "//",
    title: "Solutions are centralized",
    desc: "MoonPay Agents, Visa, Google AP2 \u2014 all require human KYC at setup. No permissionless path exists.",
  },
];

export default function Problem() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            The Problem
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            AI agents can&apos;t open
            <br />
            <span className="text-[var(--muted)]">bank accounts.</span>
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-20 text-base">
            Every agent payment protocol solves crypto-to-crypto. The fiat
            bridge is the missing piece.
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <SectionReveal key={it.title} delay={i * 0.1}>
              <div className="frost p-8 h-full">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/[0.08] border border-[var(--accent)]/[0.15] flex items-center justify-center text-sm text-[var(--accent)] font-mono font-bold mb-5">
                  {it.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{it.title}</h3>
                <p className="text-sm text-[var(--secondary)] leading-relaxed">
                  {it.desc}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
