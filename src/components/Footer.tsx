import { LINKS } from "@/lib/constants";

const nav = [
  { label: "Documentation", href: LINKS.docs },
  { label: "GitHub", href: LINKS.github },
  { label: "Twitter", href: LINKS.twitter },
  { label: "Discord", href: LINKS.discord },
  { label: "Peer App", href: LINKS.app },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-mono text-xs font-bold">P</span>
              </div>
              <span className="font-semibold text-sm tracking-tight">
                PayHumans<span className="text-[var(--accent)]">.ai</span>
              </span>
            </div>
            <span className="text-xs text-[var(--muted)]">
              Built by P2P Labs &middot; Powered by Peer Protocol
            </span>
          </div>

          <div className="flex items-center gap-6">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
