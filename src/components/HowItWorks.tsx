import Link from "next/link";
import SectionReveal from "./SectionReveal";
import LifecycleDiagram from "./diagrams/LifecycleDiagram";
import { EscrowIcon, HumanIcon, WalletIcon } from "./diagrams/Icons";
import { LINKS } from "@/lib/constants";

const phases: {
  Icon: typeof WalletIcon;
  n: string;
  title: string;
  chain: string;
  color: string;
  body: string;
  planned?: string;
}[] = [
  {
    Icon: WalletIcon,
    n: "01",
    title: "Fund",
    chain: "Solana USDC",
    color: "#c084fc",
    body: "The agent's Solana wallet holds USDC and a little SOL for network fees.",
  },
  {
    Icon: EscrowIcon,
    n: "02",
    title: "Escrow",
    chain: "Peer escrow",
    color: "#60a5fa",
    body: "The agent creates a Peer escrow deposit: USDC amount, recipient, platform, and a rate in fiat per USDC.",
  },
  {
    Icon: HumanIcon,
    n: "03",
    title: "Claim",
    chain: "Payment app",
    color: "#4ade80",
    body: "A human claims, pays the recipient in fiat, proves it, and receives the escrowed USDC.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <SectionReveal className="max-w-2xl mb-10">
          <p className="eyebrow mb-4">Lifecycle</p>
          <h2 className="section-title">Fund. Escrow. Claim.</h2>
        </SectionReveal>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {phases.map(({ Icon, n, title, chain, color, body, planned }, i) => (
            <SectionReveal key={title} delay={i * 0.06}>
              <div className="frost h-full p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: color }} />
                <div className="flex items-center justify-between mb-5">
                  <Icon size={20} style={{ color }} />
                  <span className="font-mono text-[11px] text-[var(--muted)]">{n}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="font-mono text-[11px] mb-3" style={{ color }}>{chain}</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
                {planned ? (
                  <p className="mt-4 inline-flex rounded-md border border-dashed border-[#c084fc]/40 px-2.5 py-1 font-mono text-[11px] text-[#c084fc]">
                    {planned}
                  </p>
                ) : null}
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Inside the claim</h3>
          <p className="text-sm text-[var(--muted)] max-w-sm leading-relaxed">
            Each row is a participant. Read left to right to see who acts and where money
            moves.{" "}
            <Link href={`${LINKS.docs}#lifecycle`} className="text-[var(--secondary)] underline underline-offset-4 decoration-white/20">
              Full lifecycle
            </Link>
          </p>
        </SectionReveal>
        <SectionReveal>
          <LifecycleDiagram />
        </SectionReveal>
      </div>
    </section>
  );
}
