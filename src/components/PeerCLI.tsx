import Link from "next/link";
import SectionReveal from "./SectionReveal";
import CodeBlock from "./CodeBlock";
import { CLI, CLI_QUICKSTART } from "@/lib/constants";

export default function PeerCLI() {
  return (
    <section id="agents" className="py-20 md:py-28 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-center">
          <SectionReveal className="min-w-0">
            <p className="eyebrow mb-4">For agents</p>
            <h2 className="section-title mb-5">One small CLI.</h2>
            <p className="text-[var(--secondary)] leading-relaxed mb-6">
              <code className="font-mono text-[var(--fg)]">{CLI.bin}</code> does four things:
              list supported platforms, create a request, check it, and withdraw. Every write
              is a dry run until you add <code className="font-mono text-[var(--fg)]">--yes</code>.
            </p>
            <Link
              href="/docs#quickstart"
              className="arrow-link inline-flex items-center gap-2 text-sm text-[#60a5fa] hover:text-[#93c5fd] font-medium"
            >
              Agent quickstart <span className="arrow">&rarr;</span>
            </Link>
          </SectionReveal>

          <SectionReveal className="min-w-0" delay={0.08}>
            <CodeBlock title={CLI.bin}>{CLI_QUICKSTART}</CodeBlock>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
