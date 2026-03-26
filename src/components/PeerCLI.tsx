"use client";

import SectionReveal from "./SectionReveal";
import CodeBlock from "./CodeBlock";
import { LINKS } from "@/lib/constants";

const features = [
  { title: "JSON-first output", desc: "Structured ok/error envelope on every command. Pipe it, parse it, ship it.", mono: "{ ok, data, meta }" },
  { title: "MCP server", desc: "88 payment tools exposed via Model Context Protocol. One command to start.", mono: "peer mcp --full" },
  { title: "X402 ready", desc: "Pay-per-request APIs. Agents pay in USDC micropayments.", mono: "x-payment: x402" },
  { title: "Prepared txns", desc: "Preview before broadcast. Add --yes to auto-confirm.", mono: "--yes" },
  { title: "Auto error codes", desc: "Code, category, retryable flag, suggestion. Every error.", mono: "retryable: true" },
  { title: "Env switching", desc: "Production, preproduction, staging. One flag.", mono: "--env staging" },
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
    <section id="cli" className="py-20 md:py-32 px-6">
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
            JSON-first. MCP-native. Every command your agent needs
            to quote, trade, deposit, and settle.
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <SectionReveal>
            <CodeBlock title="peer-cli">{code}</CodeBlock>
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
                    <code className="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent)]/[0.08] border border-[var(--accent)]/[0.1] px-2.5 py-1 rounded whitespace-nowrap shrink-0">
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
