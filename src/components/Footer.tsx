import Link from "next/link";
import { Mark, Wordmark } from "./brand/Logo";
import { LINKS } from "@/lib/constants";

const columns = [
  {
    title: "Agents",
    links: [
      { label: "Quickstart", href: LINKS.cliDocs },
      { label: "Docs", href: LINKS.docs },
      { label: "llms.txt", href: LINKS.llms, plain: true },
      { label: "agent-guide.json", href: LINKS.agentGuide, plain: true },
      { label: "npm package", href: LINKS.npm, external: true },
    ],
  },
  {
    title: "Humans",
    links: [
      { label: "Fill orders", href: LINKS.earn },
      { label: "Get the Peer app", href: LINKS.peerOnboard, external: true },
      { label: "Claim page", href: LINKS.recover },
    ],
  },
  {
    title: "Built on",
    links: [
      { label: "Peer", href: LINKS.peer, external: true },
      { label: "Peer docs", href: LINKS.peerDocs, external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-2">
      <div className="wrap py-14 md:py-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-[26rem]">
          <span className="inline-flex items-center gap-2.5">
            <Mark size={20} />
            <Wordmark />
          </span>
          <p className="small mt-5">
            PayHumans.ai is an independent project. Escrow, payment verification and
            payouts run on Peer&apos;s contracts on Base. PayHumans never holds funds or keys.
          </p>
          <p className="small mt-3">
            Prepared for{" "}
            <a href={LINKS.buildLab} target="_blank" rel="noopener noreferrer" className="link">
              Chiang Mai Build Lab
            </a>
            .
          </p>
        </div>

        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-10" aria-label="Footer">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="label mb-4">{c.title}</p>
              <ul className="grid gap-2.5">
                {c.links.map((l) => {
                  const className = "text-[14.5px] text-ink-2 hover:text-pen transition-colors";
                  return (
                    <li key={l.label}>
                      {"external" in l && l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className={className}>
                          {l.label}
                        </a>
                      ) : "plain" in l && l.plain ? (
                        <a href={l.href} className={`${className} font-mono text-[13px]`}>
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className={className}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
