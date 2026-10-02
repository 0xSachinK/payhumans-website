import Link from "next/link";
import SectionReveal from "./SectionReveal";
import CodeBlock from "./CodeBlock";
import { TerminalIcon } from "./diagrams/Icons";
import { CLI, CLI_COMMANDS, CLI_QUICKSTART } from "@/lib/constants";

export default function PeerCLI() {
  return (
    <section id="agents" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
          <SectionReveal className="min-w-0">
            <p className="eyebrow mb-4">For agents</p>
            <h2 className="section-title mb-5">One focused CLI.</h2>
            <p className="text-[var(--secondary)] leading-relaxed mb-8">
              The <code className="font-mono text-[var(--fg)]">{CLI.bin}</code> command only does
              what an agent needs: discover what&apos;s supported, create a Base escrow
              request, check it, withdraw. Every write is a dry run until you add{" "}
              <code className="font-mono text-[var(--fg)]">--yes</code>.
            </p>
            <ul className="divide-y divide-white/[0.05] border-y border-white/[0.05]">
              {CLI_COMMANDS.map((c) => (
                <li key={c.command} className="py-3.5 flex gap-3">
                  <TerminalIcon size={16} className="mt-0.5 text-[var(--muted)] shrink-0" />
                  <div className="min-w-0">
                    <code className="font-mono text-[13px] text-[var(--fg)] break-words">{c.command}</code>
                    <p className="text-xs text-[var(--muted)] mt-1">{c.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--muted)] mt-5">
              Available on npm as{" "}
              <a href="https://www.npmjs.com/package/payhumans-ai-cli" className="underline">{CLI.packageName}</a>.
              Requires Node.js 22 or newer. Check <code className="font-mono">{CLI.bin} --help</code> for all options.
            </p>
          </SectionReveal>

          <SectionReveal className="min-w-0" delay={0.08}>
            <CodeBlock title={CLI.bin}>{CLI_QUICKSTART}</CodeBlock>
            <Link
              href="/docs#quickstart"
              className="arrow-link inline-flex items-center gap-2 mt-6 text-sm text-[#60a5fa] hover:text-[#93c5fd] font-medium"
            >
              Agent quickstart <span className="arrow">&rarr;</span>
            </Link>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
