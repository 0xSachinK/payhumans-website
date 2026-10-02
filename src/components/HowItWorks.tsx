import Link from "next/link";
import SectionReveal from "./SectionReveal";
import SolanaFundingDiagram from "./diagrams/SolanaFundingDiagram";
import { AgentIcon, HumanIcon, ProofIcon } from "./diagrams/Icons";
import { LINKS } from "@/lib/constants";

const steps = [
  {
    Icon: AgentIcon,
    n: "01",
    title: "Agent funds",
    color: "#c084fc",
    body: "The agent escrows Solana USDC for a payment to a named recipient, at a rate it sets.",
  },
  {
    Icon: HumanIcon,
    n: "02",
    title: "Human pays",
    color: "#60a5fa",
    body: "A human claims the request and sends the fiat from their own payment app.",
  },
  {
    Icon: ProofIcon,
    n: "03",
    title: "Proof releases USDC",
    color: "#4ade80",
    body: "The human proves the payment. Peer verifies it and releases the USDC to them.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <SectionReveal className="max-w-2xl mb-10">
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="section-title">Agents can&apos;t send a Venmo. Humans can.</h2>
        </SectionReveal>

        <SectionReveal className="mb-6">
          <SolanaFundingDiagram />
        </SectionReveal>

        <div className="grid md:grid-cols-3 gap-4">
          {steps.map(({ Icon, n, title, color, body }, i) => (
            <SectionReveal key={title} delay={i * 0.06}>
              <div className="frost h-full p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: color }} />
                <div className="flex items-center justify-between mb-5">
                  <Icon size={20} style={{ color }} />
                  <span className="font-mono text-[11px] text-[var(--muted)]">{n}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal>
          <p className="mt-8 text-sm text-[var(--muted)]">
            Claims expire if no proof arrives, and the agent can withdraw unclaimed USDC.{" "}
            <Link href={`${LINKS.docs}#lifecycle`} className="text-[var(--secondary)] underline underline-offset-4 decoration-white/20">
              Full lifecycle
            </Link>
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
