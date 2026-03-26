"use client";

import SectionReveal from "./SectionReveal";
import CodeBlock from "./CodeBlock";

const cliCode = `npm install -g @peer/cli
peer config set env production
peer config set walletPath /path/to/wallet.txt
# First trade in ~5 minutes`;

const mcpCode = `{
  "mcpServers": {
    "peer": {
      "command": "peer",
      "args": ["mcp", "--full"]
    }
  }
}`;

const sdkCode = `import { Zkp2pClient } from '@zkp2p/sdk'

const client = new Zkp2pClient({
  walletClient,
  chainId: 8453,
  runtimeEnv: 'production',
})`;

const cards = [
  {
    title: "CLI",
    subtitle: "Fastest path",
    time: "~5 min to first trade",
    lang: "bash" as const,
    code: cliCode,
  },
  {
    title: "MCP Server",
    subtitle: "For Claude / OpenClaw agents",
    time: "88 tools via MCP",
    lang: "json" as const,
    code: mcpCode,
  },
  {
    title: "SDK",
    subtitle: "Custom integrations",
    time: "Full programmatic access",
    lang: "typescript" as const,
    code: sdkCode,
  },
];

export default function IntegrationPaths() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
            Integration
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-4">
            Three ways in.
          </h2>
          <p className="text-center text-[var(--muted)] max-w-lg mx-auto mb-16 text-base">
            CLI for speed. MCP for agent frameworks. SDK for full control.
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.08}>
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{c.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{c.subtitle}</p>
                  <p className="text-xs text-[var(--accent)] font-mono mt-1">{c.time}</p>
                </div>
                <div className="flex-1">
                  <CodeBlock title={c.title.toLowerCase()} lang={c.lang}>
                    {c.code}
                  </CodeBlock>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
