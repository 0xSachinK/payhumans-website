import SectionReveal from "./SectionReveal";
import { AgentIcon, HumanIcon } from "./diagrams/Icons";

const roles = [
  {
    Icon: AgentIcon,
    who: "Agent",
    color: "#60a5fa",
    spends: "USDC",
    gets: "A fiat payment delivered",
    does: [
      "Holds USDC plus a little ETH for gas on Base",
      "Checks platform and currency support",
      "Escrows USDC with recipient, amount, and rate",
      "Watches status; withdraws unclaimed USDC",
    ],
  },
  {
    Icon: HumanIcon,
    who: "Human",
    color: "#4ade80",
    spends: "Fiat, from their own account",
    gets: "USDC from escrow",
    does: [
      "Claims a request on /earn before paying",
      "Pays exactly the requested recipient and amount",
      "Proves the payment before the claim expires",
    ],
  },
];

export default function Differentiator() {
  return (
    <section id="roles" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <SectionReveal className="max-w-2xl mb-12">
          <p className="eyebrow mb-4">Who does what</p>
          <h2 className="section-title">The human spends fiat and receives USDC.</h2>
          <p className="mt-5 text-[var(--secondary)] leading-relaxed">
            The agent sets an exchange rate: how much fiat the human sends per USDC
            they receive. A rate below 1:1 means the human receives more USDC than the
            fiat they spend. That difference is the reward.
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-[1fr_1fr_0.9fr] gap-4">
          {roles.map(({ Icon, who, color, spends, gets, does }, i) => (
            <SectionReveal key={who} delay={i * 0.06}>
              <div className="frost h-full p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center border"
                    style={{ color, borderColor: `${color}55`, background: `${color}12` }}
                  >
                    <Icon size={18} />
                  </span>
                  <h3 className="text-lg font-semibold">{who}</h3>
                </div>
                <dl className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="rounded-lg border border-white/[0.06] p-3">
                    <dt className="text-[11px] font-mono text-[var(--muted)] mb-1">Spends</dt>
                    <dd className="font-medium">{spends}</dd>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] p-3">
                    <dt className="text-[11px] font-mono text-[var(--muted)] mb-1">Gets</dt>
                    <dd className="font-medium">{gets}</dd>
                  </div>
                </dl>
                <ul className="space-y-2.5">
                  {does.map((d) => (
                    <li key={d} className="flex gap-2.5 text-sm text-[var(--secondary)]">
                      <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          ))}

          <SectionReveal delay={0.12}>
            <figure className="diagram-frame h-full !p-6" aria-label="Exchange rate example">
              <p className="eyebrow !text-[var(--muted)] mb-5">Rate example</p>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between rounded-lg border border-[#4ade80]/30 bg-[#4ade80]/[0.06] px-4 py-3">
                  <span className="text-[var(--secondary)]">Human sends</span>
                  <span className="text-[#4ade80] font-semibold">$4.90 USD</span>
                </div>
                <div className="flex items-center justify-center text-[11px] text-[var(--muted)] gap-2">
                  <span className="h-px flex-1 bg-white/[0.08]" />
                  rate 0.98 USD per USDC
                  <span className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#60a5fa]/30 bg-[#60a5fa]/[0.06] px-4 py-3">
                  <span className="text-[var(--secondary)]">Human receives</span>
                  <span className="text-[#60a5fa] font-semibold">5.00 USDC</span>
                </div>
              </div>
              <figcaption className="mt-5 text-xs text-[var(--muted)] leading-relaxed">
                Illustrative only. Excludes gas and any protocol fees. Whether a rate is
                worth taking is the human&apos;s call.
              </figcaption>
            </figure>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
