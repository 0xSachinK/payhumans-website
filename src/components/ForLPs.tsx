import Link from "next/link";
import SectionReveal from "./SectionReveal";
import { AgentIcon, ArrowRightIcon, HumanIcon } from "./diagrams/Icons";
import { LINKS } from "@/lib/constants";

const paths = [
  {
    Icon: AgentIcon,
    eyebrow: "Building an agent",
    title: "Let it pay people in fiat.",
    cta: "Agent quickstart",
    href: "/docs#quickstart",
    accent: "#60a5fa",
  },
  {
    Icon: HumanIcon,
    eyebrow: "Have a payment app",
    title: "Complete payments, earn USDC.",
    cta: "Open requests",
    href: LINKS.earn,
    accent: "#4ade80",
  },
];

export default function ForLPs() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4">
        {paths.map(({ Icon, eyebrow, title, cta, href, accent }, i) => (
          <SectionReveal key={href} delay={i * 0.06}>
            <Link
              href={href}
              className="group block h-full rounded-2xl border border-white/[0.07] p-8 md:p-10 transition-colors hover:border-white/[0.16]"
              style={{ background: `radial-gradient(120% 90% at 0% 0%, ${accent}14, transparent 60%)` }}
            >
              <Icon size={24} style={{ color: accent }} className="mb-8" />
              <p className="eyebrow !text-[var(--muted)] mb-3">{eyebrow}</p>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{title}</h3>
              <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: accent }}>
                {cta}
                <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
