import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CodeBlock from "@/components/CodeBlock";
import MoneyFlowDiagram from "@/components/diagrams/MoneyFlowDiagram";
import SolanaFundingDiagram from "@/components/diagrams/SolanaFundingDiagram";
import LifecycleDiagram from "@/components/diagrams/LifecycleDiagram";
import StateDiagram from "@/components/diagrams/StateDiagram";
import { AlertIcon } from "@/components/diagrams/Icons";
import { CLI, LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Docs — PayHumans.ai",
  description:
    "How PayHumans.ai works: agent and human responsibilities, the request lifecycle, expiry and cancellation, payment verification limits, and the payhumans CLI.",
  alternates: { canonical: "https://payhumans.ai/docs" },
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "solana", label: "Chains and Solana plans" },
  { id: "roles", label: "Responsibilities" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "quickstart", label: "Agent quickstart" },
  { id: "humans", label: "Human guide" },
  { id: "expiry", label: "Expiry and cancellation" },
  { id: "verification", label: "Verification limits" },
  { id: "status", label: "Project status" },
];


const discover = `${CLI.bin} platforms`;

const create = `# Dry run (default): prints what would be escrowed, sends nothing
${CLI.bin} deposit create --platform venmo \\
  --recipient '<handle>' --amount 5 --currency USD --rate 0.98

# Execute. Signer is read from PAYHUMANS_PRIVATE_KEY or DEPLOYER_KEY
${CLI.bin} deposit create --platform venmo --recipient '<handle>' \\
  --amount 5 --currency USD --rate 0.98 --yes`;

const manage = `${CLI.bin} deposit show <deposit-id>
${CLI.bin} deposit withdraw --id <deposit-id> --amount 5          # dry run
${CLI.bin} deposit withdraw --id <deposit-id> --amount 5 --yes`;

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="callout">
      <AlertIcon size={18} className="text-[var(--amber)] shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <Navigation />
      <main className="flex-1 px-6 pt-28 md:pt-36 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[200px_1fr] gap-12">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-1" aria-label="Docs sections">
              <p className="eyebrow !text-[var(--muted)] mb-4">On this page</p>
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="block text-sm text-[var(--muted)] hover:text-[var(--fg)] py-1 transition-colors"
                >
                  {t.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="docs-prose min-w-0 max-w-3xl">
            <header className="mb-14">
              <p className="eyebrow mb-4">Documentation</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em] mb-5">
                How PayHumans works
              </h1>
              <p className="!text-lg">
                Agents escrow USDC on Base for a fiat
                payment to a named recipient. Humans
                make that payment from their own accounts, prove it, and receive the
                escrowed USDC.
              </p>
            </header>

            <section id="overview" className="docs-section">
              <h2>Overview</h2>
              <p>
                Money moves in two currencies and two places. USDC moves onchain between the
                agent, the escrow contract, and the human. Fiat moves offchain, from the
                human&apos;s payment account to the recipient. A proof of the fiat payment
                is what links the two.
              </p>
              <div className="mt-6">
                <MoneyFlowDiagram />
              </div>
            </section>

            <section id="solana" className="docs-section">
              <h2>Chains and Solana plans</h2>
              <p>
                <strong className="text-[var(--fg)]">Today:</strong> everything runs on Base.
                The agent needs USDC plus a little ETH for gas in a Base wallet to create or
                withdraw a Peer escrow deposit. Humans claim, prove, and receive USDC on Base.
              </p>
              <p>
                <strong className="text-[var(--fg)]">Planned:</strong> PayHumans is intended for
                Solana agents. A future Peer and Relay integration would let an agent start from
                Solana USDC or SOL and bridge to USDC on Base. It is not available yet: there is
                no Solana funding page, no Solana deposit, and no Solana escrow program. When it
                ships, escrow and payouts would still settle on Base, and the agent would also
                need SOL for Solana network fees.
              </p>
              <div className="mt-6">
                <SolanaFundingDiagram />
              </div>
            </section>

            <section id="roles" className="docs-section">
              <h2>Responsibilities</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="frost p-5">
                  <h3 className="!mt-0">Agent</h3>
                  <ul>
                    <li>Check the platform and currency are supported with <code>{CLI.bin} platforms</code>.</li>
                    <li>Supply a correct recipient identifier for that platform.</li>
                    <li>Choose an amount and a rate a human will accept.</li>
                    <li>Hold enough USDC on Base plus gas; keep the signing key in the environment.</li>
                    <li>Watch status and withdraw USDC that is no longer needed.</li>
                  </ul>
                </div>
                <div className="frost p-5">
                  <h3 className="!mt-0">Human</h3>
                  <ul>
                    <li>Claim the request on <Link href={LINKS.earn}>/earn</Link> before paying.</li>
                    <li>Pay the exact recipient, amount, and currency shown, from an account you control.</li>
                    <li>Install the protocol payment-verification extension and generate the proof.</li>
                    <li>Submit the proof before the claim expires.</li>
                    <li>Follow your payment platform&apos;s own terms.</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6">
                <strong className="text-[var(--fg)]">Who spends what.</strong> The human spends
                fiat and receives USDC. The agent spends USDC. The rate is fiat per USDC, so at
                a rate of <code>0.98</code> a human who sends $4.90 receives 5 USDC (before gas
                and any protocol fees). The agent pays for the service through that rate.
              </p>
            </section>

            <section id="lifecycle" className="docs-section">
              <h2>Lifecycle</h2>
              <ol>
                <li><strong className="text-[var(--fg)]">Request.</strong> The agent creates a deposit: USDC is locked in escrow with the recipient, platform, currency, and rate.</li>
                <li><strong className="text-[var(--fg)]">Claim.</strong> A human claims it on this site. This creates an onchain intent that reserves the USDC for them for a limited time.</li>
                <li><strong className="text-[var(--fg)]">Pay.</strong> The human sends fiat to the recipient through their own supported payment account.</li>
                <li><strong className="text-[var(--fg)]">Prove.</strong> The human generates a payment proof with the verification extension and submits it.</li>
                <li><strong className="text-[var(--fg)]">Settle.</strong> If the proof matches the intent, the escrow releases USDC to the human.</li>
              </ol>
              <div className="mt-6">
                <LifecycleDiagram />
              </div>
            </section>

            <section id="quickstart" className="docs-section">
              <h2>Agent quickstart</h2>
              <p>
                The <code>{CLI.packageName}</code> package provides the <code>{CLI.bin}</code>{" "}
                binary. It is deliberately small: discovery, deposit creation, status, and
                withdrawal. It is in active development, so treat <code>--help</code> as the
                source of truth for flags.
              </p>
              <h3>1. Install</h3>
              <p>
                Requires Node.js 22 or newer. Version 0.1.0 is available on{" "}
                <a href="https://www.npmjs.com/package/payhumans-ai-cli">npm</a>.
              </p>
              <div className="mt-3"><CodeBlock title="install">{"npm install -g payhumans-ai-cli@0.1.0\npayhumans --help"}</CodeBlock></div>
              <h3>2. Fund a Base wallet</h3>
              <p>
                Hold USDC plus a little ETH for gas on Base in the wallet whose key the CLI will
                use. Funding from Solana is planned, not available yet.
              </p>
              <h3>3. Check what is supported</h3>
              <p>Platform and currency support varies and can change. Query it every time rather than hard-coding a list.</p>
              <div className="mt-3"><CodeBlock title="discover">{discover}</CodeBlock></div>
              <h3>4. Create a request</h3>
              <p>
                Writes are dry runs by default. Read the dry-run output, including exactly how
                much USDC will be escrowed, then repeat with <code>--yes</code>.{" "}
                <code>--amount</code> is in USDC; <code>--rate</code> is fiat per USDC.
              </p>
              <div className="mt-3"><CodeBlock title="create">{create}</CodeBlock></div>
              <Callout>
                <p>
                  Set <code>PAYHUMANS_PRIVATE_KEY</code> (or <code>DEPLOYER_KEY</code>) in the
                  agent&apos;s environment through your secret manager. Never paste a key into
                  a prompt, a command line argument, or this site.
                </p>
              </Callout>
              <h3>5. Share, track, and withdraw</h3>
              <p>The CLI returns a claim URL after the deposit confirms. Share it with the human executor. Requests are loaded by deposit ID; this version does not provide a global job marketplace.</p>
              <div className="mt-3"><CodeBlock title="manage">{manage}</CodeBlock></div>
            </section>

            <section id="humans" className="docs-section">
              <h2>Human guide</h2>
              <ol>
                <li>Open the agent’s claim link, or enter its deposit ID on <Link href={LINKS.earn}>/earn</Link>. Sign in with email or an existing passkey. Privy creates your PayHumans wallet automatically; no browser wallet extension is required. After email login, use “Add a passkey” in the wallet menu to enable passkey login on future visits.</li>
                <li>Pick a request on a platform and currency you already use. Check the rate and the USDC you would receive.</li>
                <li>Keep a little ETH on Base in your PayHumans wallet for network fees. Review and confirm the claim transaction. Wait for the confirmed intent and check its active status and expiry before sending fiat.</li>
                <li>Send exactly the amount shown to exactly the recipient shown.</li>
                <li>Select “I paid — verify payment” in your intent, authenticate through the Peer verification extension, select the matching payment, and confirm the fulfillment transaction before expiry. Keep your intent link to reopen it later.</li>
              </ol>
              <Callout>
                <p>
                  You are spending your own money first. If you pay before claiming, pay the
                  wrong recipient or amount, or prove after the claim expires, the escrow will
                  not release USDC and this site cannot recover the fiat.
                </p>
              </Callout>
            </section>

            <section id="expiry" className="docs-section">
              <h2>Expiry and cancellation</h2>
              <ul>
                <li>A claim reserves USDC for a limited window. If it lapses without a valid proof, the USDC returns to the open request and can be claimed again.</li>
                <li>A claim can be cancelled before payment; the reserved USDC is released the same way.</li>
                <li>The agent can withdraw USDC that is not reserved by an active claim. Reserved USDC becomes withdrawable after the claim expires or is cancelled.</li>
              </ul>
              <div className="mt-6">
                <StateDiagram />
              </div>
            </section>

            <section id="verification" className="docs-section">
              <h2>Verification limits</h2>
              <p>
                Payment verification is performed by the protocol&apos;s verification
                extension and the escrow contract, not by this site. It has limits:
              </p>
              <ul>
                <li>Only supported platforms and currencies can be proved, and support differs between them.</li>
                <li>The proof must match the intent: recipient, amount, currency, and a payment made after the claim.</li>
                <li>A proof shows a payment was made from the human&apos;s account. It does not cover later reversals, disputes, or platform-side holds.</li>
                <li>Platform changes (new login flows, page changes) can temporarily break proof generation.</li>
              </ul>
            </section>

            <section id="status" className="docs-section">
              <h2>Project status</h2>
              <p>
                PayHumans.ai is an independent project. Escrow and payment verification use
                Peer protocol contracts on Base; this site does not custody funds. Solana USDC/SOL
                funding through Peer and Relay is planned and not live; there is no Solana escrow
                program. The{" "}
                <code>{CLI.bin}</code> CLI is under active development, and a genuine
                end-to-end proof completion through this site has not been verified yet.
                Start with small amounts.
              </p>
              <p>
                Prepared for{" "}
                <a href={LINKS.buildLab} target="_blank" rel="noopener noreferrer">
                  Chiang Mai Build Lab
                </a>
                .
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
