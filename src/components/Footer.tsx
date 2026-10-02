import Link from "next/link";
import { LINKS } from "@/lib/constants";

const nav = [
  { label: "Docs", href: LINKS.docs },
  { label: "Agent quickstart", href: "/docs#quickstart" },
  { label: "Earn", href: LINKS.earn },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-14 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <span className="font-semibold text-sm tracking-tight">
            PayHumans<span className="text-[var(--muted)]">.ai</span>
          </span>
          <p className="text-xs text-[var(--muted)] max-w-md leading-relaxed">
            An independent project. Escrow, payment verification, and payouts use Peer
            protocol contracts on Base. Solana funding is planned, not live. This site does
            not custody funds.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Prepared for{" "}
            <a
              href={LINKS.buildLab}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--secondary)] underline underline-offset-4 decoration-white/20 hover:text-[var(--fg)]"
            >
              Chiang Mai Build Lab
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
