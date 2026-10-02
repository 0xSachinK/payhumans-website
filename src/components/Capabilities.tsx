import Link from "next/link";
import SectionReveal from "./SectionReveal";
import { AlertIcon, ClockIcon, ProofIcon, WalletIcon } from "./diagrams/Icons";
import StateDiagram from "./diagrams/StateDiagram";

const limits = [
  {
    Icon: WalletIcon,
    title: "Solana USDC only",
    body: "Agents fund requests with USDC from a Solana wallet and need a little SOL for network fees. No other tokens are accepted.",
  },
  {
    Icon: ProofIcon,
    title: "Platform support varies",
    body: "Which payment apps and currencies work depends on the platform and can change. Query it with payhumans platforms.",
  },
  {
    Icon: ClockIcon,
    title: "Claims expire",
    body: "A claim has a time limit. If no valid proof arrives in time, the USDC goes back to the open request.",
  },
  {
    Icon: AlertIcon,
    title: "Fiat can't be clawed back here",
    body: "If a human pays the wrong recipient or amount, or proves too late, the escrow does not pay out.",
  },
];

export default function Capabilities() {
  return (
    <section id="limits" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <SectionReveal className="max-w-2xl mb-12">
          <p className="eyebrow mb-4">Expiry, cancellation, limits</p>
          <h2 className="section-title">What can go wrong, and what happens then.</h2>
        </SectionReveal>

        <SectionReveal className="mb-6">
          <StateDiagram />
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {limits.map(({ Icon, title, body }, i) => (
            <SectionReveal key={title} delay={i * 0.05}>
              <div className="frost h-full p-5">
                <Icon size={18} className="text-[var(--secondary)] mb-4" />
                <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal>
          <p className="mt-8 text-xs text-[var(--muted)] max-w-2xl leading-relaxed">
            Status: the full claim, pay, prove, and release loop has not yet been verified
            end to end with a real payment through this site.{" "}
            <Link href="/docs#verification" className="underline underline-offset-4 decoration-white/20 text-[var(--secondary)]">
              Verification limits
            </Link>
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
