"use client";

import SectionReveal from "../SectionReveal";

const upcoming = [
  {
    title: "Headless Proof Generation",
    description:
      "Agents become buyers — not just LPs. Automated proof generation without a browser extension.",
    tag: "In Development",
    color: "var(--accent)",
  },
  {
    title: "Executor Reputation System",
    description:
      "On-chain reputation tiers: New, Verified, Trusted, Elite. Higher tiers unlock larger jobs and priority matching.",
    tag: "Planned",
    color: "var(--green)",
  },
  {
    title: "Webhook Notifications",
    description:
      "Real-time event webhooks for agents. Get notified when intents are created, fulfilled, or expired.",
    tag: "Planned",
    color: "var(--purple)",
  },
  {
    title: "Auto-Matching",
    description:
      "Register your preferred platforms and currencies. Get notified when matching jobs appear.",
    tag: "Coming Later",
    color: "var(--amber)",
  },
];

export default function EarnRoadmap() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--green)] font-mono mb-4 text-center">
            Roadmap
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            What&apos;s coming next
          </h2>
          <p className="text-[var(--secondary)] text-center max-w-lg mx-auto mb-12 text-base">
            We&apos;re building the infrastructure for the agent economy.
            Here&apos;s what&apos;s on deck.
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 gap-4">
          {upcoming.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.08}>
              <div className="frost p-6 h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <span
                    className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      color: item.color,
                      borderColor: `color-mix(in srgb, ${item.color} 25%, transparent)`,
                      background: `color-mix(in srgb, ${item.color} 6%, transparent)`,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
