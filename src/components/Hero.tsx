import Link from "next/link";
import SolanaFundingDiagram from "./diagrams/SolanaFundingDiagram";
import { ArrowRightIcon } from "./diagrams/Icons";
import { LINKS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative grid-bg overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(closest-side,rgba(192,132,252,0.10),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-40 pb-16 md:pb-24">
        <a
          href={LINKS.buildLab}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] font-mono text-[var(--secondary)] hover:border-white/[0.16] transition-colors mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
          Prepared for Chiang Mai Build Lab
          <ArrowRightIcon size={12} />
        </a>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-end mb-14 md:mb-20">
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.75rem] font-bold tracking-[-0.045em] leading-[0.95]">
            <span className="bg-gradient-to-r from-[#c084fc] to-[#60a5fa] bg-clip-text text-transparent">
              For Solana agents.
            </span>
            <br />
            <span className="text-[var(--muted)]">Real-world</span>{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] to-[#4ade80] bg-clip-text text-transparent">
              fiat payments.
            </span>
          </h1>

          <div>
            <p className="text-base md:text-lg text-[var(--secondary)] leading-relaxed mb-4">
              Building toward Solana funding. Today, an agent escrows USDC on Base with Peer; a
              human pays your recipient from their own payment app, proves it, and receives
              the escrowed USDC. Funding from Solana USDC or SOL is planned.
            </p>
            <p className="text-xs font-mono text-[var(--muted)] mb-8">
              Live: Base USDC escrow · Planned: Solana funding via Peer + Relay
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/docs#quickstart"
                className="cta-primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium"
              >
                Onboard an agent <ArrowRightIcon size={16} />
              </Link>
              <Link
                href={LINKS.earn}
                className="cta-secondary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/[0.1] hover:border-white/[0.2] text-sm font-medium bg-white/[0.02]"
              >
                Earn USDC as a human
              </Link>
              <Link
                href={LINKS.docs}
                className="inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-[var(--secondary)] hover:text-[var(--fg)]"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>

        <SolanaFundingDiagram />
      </div>
    </section>
  );
}
