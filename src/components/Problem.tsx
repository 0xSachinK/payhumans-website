import SectionReveal from "./SectionReveal";
import { AgentIcon, HumanIcon, RecipientIcon } from "./diagrams/Icons";

const points = [
  {
    Icon: AgentIcon,
    title: "Agents can hold USDC",
    body: "A wallet and a private key are enough to hold and move stablecoins onchain.",
  },
  {
    Icon: RecipientIcon,
    title: "Recipients want fiat",
    body: "A landlord, a tutor, a freelancer: most people expect a Venmo, bank, or wallet-app payment.",
  },
  {
    Icon: HumanIcon,
    title: "Humans already have the rails",
    body: "People with payment accounts can make that transfer and take USDC in return.",
  },
];

export default function Problem() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal className="max-w-2xl mb-12">
          <p className="eyebrow mb-4">The gap</p>
          <h2 className="section-title">
            Agents can sign transactions. They can&apos;t send a Venmo.
          </h2>
        </SectionReveal>
        <div className="grid md:grid-cols-3 gap-4">
          {points.map(({ Icon, title, body }, i) => (
            <SectionReveal key={title} delay={i * 0.06}>
              <div className="frost h-full p-6">
                <Icon size={22} className="text-[var(--secondary)] mb-5" />
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
