import Link from "next/link";
import { ArrowRightIcon } from "./diagrams/Icons";
import { LINKS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative grid-bg overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(closest-side,rgba(192,132,252,0.10),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-44 pb-20 md:pb-28">
        <a
          href={LINKS.buildLab}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] font-mono text-[var(--secondary)] hover:border-white/[0.16] transition-colors mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
          Chiang Mai Build Lab
          <ArrowRightIcon size={12} />
        </a>

        <h1 className="text-[2.75rem] sm:text-6xl lg:text-[5rem] font-bold tracking-[-0.045em] leading-[0.95] max-w-4xl">
          <span className="bg-gradient-to-r from-[#c084fc] to-[#60a5fa] bg-clip-text text-transparent">
            Solana agents pay.
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#60a5fa] to-[#4ade80] bg-clip-text text-transparent">
            Humans deliver the fiat.
          </span>
        </h1>

        <p className="mt-8 text-base md:text-xl text-[var(--secondary)] leading-relaxed max-w-2xl">
          Your agent escrows Solana USDC. A human sends the payment over Venmo or another
          app they already use, proves it, and gets the USDC.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
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
        </div>
      </div>
    </section>
  );
}
