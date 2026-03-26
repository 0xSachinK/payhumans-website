"use client";

import SectionReveal from "./SectionReveal";

const flows = [
  {
    label: "Agent buys USDC",
    tag: "ON-RAMP",
    color: "var(--accent)",
    steps: [
      { actor: "Agent", action: "Finds LP with fiat access" },
      { actor: "Human", action: "Sends fiat payment" },
      { actor: "Protocol", action: "Verifies via ZK proof" },
      { actor: "Escrow", action: "Releases USDC to agent" },
    ],
  },
  {
    label: "Agent provides liquidity",
    tag: "LP",
    color: "var(--green)",
    steps: [
      { actor: "Agent", action: "Deposits USDC via CLI" },
      { actor: "Agent", action: "Sets rates and platforms" },
      { actor: "Taker", action: "Pays fiat, proves payment" },
      { actor: "Agent", action: "Earns spread automatically" },
    ],
  },
  {
    label: "Agent sells USDC",
    tag: "OFF-RAMP",
    color: "var(--purple)",
    steps: [
      { actor: "Agent", action: "Deposits USDC in escrow" },
      { actor: "Human", action: "Pays fiat to recipient" },
      { actor: "Protocol", action: "Proof verifies payment" },
      { actor: "Human", action: "Receives USDC from escrow" },
    ],
  },
  {
    label: "Human \u2194 Human",
    tag: "P2P",
    color: "var(--amber)",
    steps: [
      { actor: "Maker", action: "Deposits USDC, sets rates" },
      { actor: "Taker", action: "Signals intent, pays fiat" },
      { actor: "Protocol", action: "ZK proof of payment" },
      { actor: "Settlement", action: "USDC released to taker" },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Protocol
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            Four flows. One marketplace.
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-20 text-base">
            Agents and humans trade across a unified P2P network. Stablecoins
            meet fiat through trustless escrow and cryptographic proofs.
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {flows.map((f, i) => (
            <SectionReveal key={f.label} delay={i * 0.07}>
              <div className="frost p-7 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">{f.label}</h3>
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] font-mono px-2.5 py-1 rounded-full border"
                    style={{
                      color: f.color,
                      borderColor: `color-mix(in srgb, ${f.color} 20%, transparent)`,
                      background: `color-mix(in srgb, ${f.color} 5%, transparent)`,
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <div className="space-y-0">
                  {f.steps.map((s, j) => (
                    <div key={j} className="flex items-start gap-4 relative">
                      {j < f.steps.length - 1 ? (
                        <div
                          className="absolute left-[11px] top-6 w-px h-[calc(100%-8px)]"
                          style={{ background: `color-mix(in srgb, ${f.color} 25%, transparent)` }}
                        />
                      ) : null}
                      <div
                        className="mt-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border"
                        style={{
                          color: f.color,
                          borderColor: `color-mix(in srgb, ${f.color} 30%, transparent)`,
                          background: `color-mix(in srgb, ${f.color} 8%, transparent)`,
                        }}
                      >
                        {j + 1}
                      </div>
                      <div className="pb-5">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-mono">
                          {s.actor}
                        </span>
                        <p className="text-sm text-[var(--secondary)]">
                          {s.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
