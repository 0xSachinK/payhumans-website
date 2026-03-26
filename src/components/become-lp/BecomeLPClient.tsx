"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import SectionReveal from "@/components/SectionReveal";
import CodeBlock from "@/components/CodeBlock";
import Footer from "@/components/Footer";
import { LINKS } from "@/lib/constants";

const lpSteps = [
  {
    number: "01",
    title: "Deposit USDC",
    description: "Deposit USDC into the on-chain escrow smart contract. Non-custodial — you retain full control.",
  },
  {
    number: "02",
    title: "Set Preferences",
    description: "Choose accepted platforms (Venmo, Wise, etc.), currencies (USD, EUR), and your spread rate.",
  },
  {
    number: "03",
    title: "Wait for Takers",
    description: "Humans browse your deposit on the /earn page and claim it when the rate matches.",
  },
  {
    number: "04",
    title: "Auto-Settlement",
    description: "Taker sends fiat, proves via ZK proof, USDC releases. You keep the spread. Fully automatic.",
  },
];

const cliCode = `# Create a deposit (provide liquidity)
peer deposit create \\
  --amount 1000 \\
  --platforms wise,venmo \\
  --currencies USD \\
  --rate 1.02 \\
  --yes

# Check your active deposits
peer indexer deposits list --depositor <your-address>

# Adjust rate on the fly
peer deposit set-rate --id <deposit-id> --rate 1.015

# Withdraw remaining balance
peer deposit withdraw --id <deposit-id>`;

const mcpCode = `{
  "mcpServers": {
    "peer": {
      "command": "peer",
      "args": ["mcp", "--full"],
      "env": {
        "PEER_ENV": "production",
        "PEER_WALLET_PATH": "~/wallet.txt"
      }
    }
  }
}`;

const sdkCode = `import { Zkp2pClient } from '@zkp2p/sdk'

const client = new Zkp2pClient({
  walletClient,
  chainId: 8453,
  runtimeEnv: 'production',
})

// Create deposit
const tx = await client.createDeposit({
  amount: '1000',
  platforms: ['wise', 'venmo'],
  currencies: ['USD'],
  rate: 1.02
})`;

const faqs = [
  {
    q: "How much can I earn?",
    a: "Earnings depend on your spread rate, the volume of takers, and competition from other LPs. A 1.5% spread on a $1000 deposit earns ~$15 per fill. Active LPs earning 2-5% monthly on deposits is typical.",
  },
  {
    q: "What's the minimum deposit?",
    a: "$10 USDC. There's no maximum — deposit as much as you want to provide.",
  },
  {
    q: "Can I withdraw anytime?",
    a: "Yes, as long as there are no active intents against your deposit. Unclaimed balances can be withdrawn instantly.",
  },
  {
    q: "What if nobody fills my deposit?",
    a: "Nothing happens. Your USDC stays safely in the on-chain escrow. Withdraw anytime. Consider adjusting your spread rate to be more competitive.",
  },
  {
    q: "Is my deposit at risk?",
    a: "No. The smart contract is non-custodial. USDC only releases when a valid ZK proof of fiat payment is submitted. No proof = no release.",
  },
];

const marketStats = [
  { value: "$20.8M+", label: "Protocol Volume" },
  { value: "1.2%", label: "Avg Spread" },
  { value: "< 5 min", label: "Avg Fill Time" },
  { value: "18+", label: "Platforms" },
];

export default function BecomeLPClient() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--accent)]/[0.03] rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-8"
            >
              <div className="badge-live text-[11px]">
                Live on Base &middot; Earning now
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[0.92] mb-6"
            >
              Provide liquidity.
              <br />
              <span className="text-[var(--accent)] glow-text">Earn spread on every payment.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-center text-lg md:text-xl text-[var(--secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Deposit USDC, set your rates, and let humans fill your orders.
              Spread earnings are automatic and on-chain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <a
                href="#for-agents"
                className="cta-primary px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[#2563eb] text-white text-sm font-medium glow-box"
              >
                I&apos;m an agent developer
              </a>
              <a
                href="#for-humans"
                className="cta-secondary px-6 py-3 rounded-lg border border-white/[0.08] hover:border-white/[0.16] text-sm font-medium bg-white/[0.02] hover:bg-white/[0.04]"
              >
                I&apos;m a human LP
              </a>
            </motion.div>

            {/* Market Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {marketStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  className="text-center py-4 px-3 rounded-xl border border-white/[0.04] bg-white/[0.015]"
                >
                  <div className="text-xl md:text-2xl font-bold font-mono text-[var(--accent)] mb-1 glow-text">
                    {s.value}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </section>

        {/* How LP Works */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionReveal>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
                How It Works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
                Four steps to earning spread
              </h2>
              <p className="text-[var(--secondary)] text-center max-w-lg mx-auto mb-16 text-base">
                Non-custodial escrow. Automatic settlement. Your USDC works for you.
              </p>
            </SectionReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {lpSteps.map((step, i) => (
                <SectionReveal key={step.number} delay={i * 0.08}>
                  <div className="frost p-6 h-full relative">
                    {i < lpSteps.length - 1 ? (
                      <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    ) : null}
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-mono text-xs font-bold mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* For Agent Developers */}
        <section id="for-agents" className="py-20 md:py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionReveal>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
                For Agent Developers
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
                Programmatic liquidity management
              </h2>
              <p className="text-[var(--secondary)] text-center max-w-lg mx-auto mb-12 text-base">
                Your agent can manage deposits, adjust rates, and withdraw — all
                programmatically via CLI, MCP, or SDK.
              </p>
            </SectionReveal>

            <div className="grid lg:grid-cols-3 gap-6">
              <SectionReveal>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Peer CLI</h3>
                    <p className="text-xs text-[var(--accent)] font-mono mt-1">Fastest path &middot; ~5 min</p>
                  </div>
                  <div className="flex-1">
                    <CodeBlock title="peer-cli" lang="bash">{cliCode}</CodeBlock>
                  </div>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.08}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">MCP Server</h3>
                    <p className="text-xs text-[var(--accent)] font-mono mt-1">For Claude / OpenClaw agents</p>
                  </div>
                  <div className="flex-1">
                    <CodeBlock title="mcp-config" lang="json">{mcpCode}</CodeBlock>
                  </div>
                </div>
              </SectionReveal>

              <SectionReveal delay={0.16}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">SDK</h3>
                    <p className="text-xs text-[var(--accent)] font-mono mt-1">Full programmatic access</p>
                  </div>
                  <div className="flex-1">
                    <CodeBlock title="sdk" lang="typescript">{sdkCode}</CodeBlock>
                  </div>
                </div>
              </SectionReveal>
            </div>

            <SectionReveal>
              <div className="text-center mt-10">
                <a
                  href={LINKS.cliDocs}
                  className="arrow-link inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[#60a5fa] transition-colors font-medium"
                >
                  Full CLI documentation <span className="arrow">&rarr;</span>
                </a>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* For Human LPs */}
        <section id="for-humans" className="py-20 md:py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <SectionReveal>
              <div className="frost p-8 md:p-16 hover:!transform-none">
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4">
                    For Human LPs
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Earn yield with your bank account.
                  </h2>
                  <p className="text-[var(--secondary)] max-w-lg mx-auto mb-10 text-base leading-relaxed">
                    Deposit USDC, set your preferred platforms and rates, and earn
                    spread whenever someone fills your order. No staking. No lockups.
                    No impermanent loss.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] flex items-center justify-center text-[var(--accent)] font-mono text-sm font-bold mx-auto mb-3">
                        1
                      </div>
                      <h4 className="text-sm font-medium mb-1">Connect & Deposit</h4>
                      <p className="text-[11px] text-[var(--muted)]">Connect wallet, deposit USDC</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] flex items-center justify-center text-[var(--accent)] font-mono text-sm font-bold mx-auto mb-3">
                        2
                      </div>
                      <h4 className="text-sm font-medium mb-1">Set Preferences</h4>
                      <p className="text-[11px] text-[var(--muted)]">Platforms, currencies, spread rate</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] flex items-center justify-center text-[var(--accent)] font-mono text-sm font-bold mx-auto mb-3">
                        3
                      </div>
                      <h4 className="text-sm font-medium mb-1">Earn Spread</h4>
                      <p className="text-[11px] text-[var(--muted)]">Automatic on every fill</p>
                    </div>
                  </div>

                  <div className="frost p-5 max-w-md mx-auto mb-8 hover:!transform-none">
                    <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
                      Example Earnings
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm text-[var(--secondary)]">$1,000 deposit at 1.5% spread</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-[var(--accent)]">~$15</div>
                        <div className="text-[10px] text-[var(--muted)]">per fill</div>
                      </div>
                    </div>
                  </div>

                  <a
                    href={LINKS.app}
                    className="cta-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[#2563eb] text-white text-sm font-medium glow-box"
                  >
                    Open Peer App to Deposit
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <SectionReveal>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-mono mb-4 text-center">
                LP FAQ
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
                Common questions
              </h2>
            </SectionReveal>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <SectionReveal key={i} delay={i * 0.05}>
                  <div className="frost p-6">
                    <h3 className="text-sm font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-[var(--secondary)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
