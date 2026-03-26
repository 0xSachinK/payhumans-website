"use client";

import SectionReveal from "./SectionReveal";
import CodeBlock from "./CodeBlock";
import { LINKS } from "@/lib/constants";

const features = [
  { title: "JSON-first output", desc: "Structured ok/error envelope on every command. Built for machines.", mono: "{ ok, data, meta }" },
  { title: "MCP server", desc: "peer mcp --full exposes 88 tools via Model Context Protocol.", mono: "peer mcp --full" },
  { title: "X402 ready", desc: "Indexer and Peerlytics APIs accept USDC micropayments per request.", mono: "x-payment: x402" },
  { title: "Prepared txns", desc: "Write commands preview before executing. Add --yes to broadcast.", mono: "--yes" },
  { title: "Auto error codes", desc: "Every error has code, category, retryable flag, and suggestion.", mono: "retryable: true" },
  { title: "Env switching", desc: "production, preproduction, staging with a single flag.", mono: "--env staging" },
];

const code = `# Get a fiat-to-USDC quote
peer quote --from USD --amount 100 --platform wise

# Create a deposit (provide liquidity)
peer deposit create --amount 1000 \\
  --platforms wise,venmo --currencies USD --rate 1.02 --yes

# Check market spreads
peer market spreads --platform wise --currency USD

# Query available liquidity
peer indexer deposits list --platform wise --currency USD

# Create a checkout session
peer checkout create --amount 50 --currency USD \\
  --description "API access fee" --yes`;

export default function PeerCLI() {
  return (
    <section id="cli" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Developer Tools
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            One CLI. 88 commands.
            <br />
            <span className="text-[var(--muted)]">Full protocol access.</span>
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-16 text-base">
            The Peer CLI is a JSON-first command-line tool and MCP server.
            Everything your agent needs.
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <SectionReveal>
            <CodeBlock title="terminal \u2014 peer-cli">{code}</CodeBlock>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="grid gap-3">
              {features.map((f) => (
                <div key={f.title} className="frost p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold mb-1">{f.title}</h4>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{f.desc}</p>
                    </div>
                    <code className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/[0.08] px-2 py-1 rounded whitespace-nowrap shrink-0">
                      {f.mono}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>

        <SectionReveal>
          <div className="text-center mt-12">
            <a
              href={LINKS.cliDocs}
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[#60a5fa] transition-colors font-medium"
            >
              Read the full CLI docs &rarr;
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
