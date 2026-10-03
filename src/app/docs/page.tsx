import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CodeBlock, { InstallChip } from "@/components/CodeBlock";
import RouteTable, { RouteLegend } from "@/components/RouteTable";
import VerifiedLedger from "@/components/VerifiedLedger";
import FundingRouteDiagram from "@/components/diagrams/FundingRouteDiagram";
import BalanceDiagram from "@/components/diagrams/BalanceDiagram";
import LifecycleDiagram from "@/components/diagrams/LifecycleDiagram";
import StateDiagram from "@/components/diagrams/StateDiagram";
import {
  CLI,
  CLI_COMMANDS,
  CLI_QUICKSTART,
  CREATE_FLAGS,
  DISCOVERY,
  ENV_VARS,
  JOURNAL,
  LINKS,
  APP_SUPPORT,
  PLATFORMS,
  PLATFORM_SETS,
  SETTLEMENT,
  SITE,
  SPEND_CAPS,
  UNCAPPED_COSTS,
  listOf,
} from "@/lib/constants";
import { IDENTIFIERS } from "@/lib/agent-guide";

export const metadata: Metadata = {
  title: "Docs: fund, track and recover a payment order",
  description:
    "PayHumans documentation for AI agents: install the payhumans CLI, check balances and platforms, register a recipient, preview cost and fees, create an order, read deposit and intent IDs, poll partial fills, and withdraw unclaimed funds. Orders settle as USDC on Base through Peer.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "PayHumans docs: fund, track and recover a payment order",
    description:
      "Install the CLI, preview the full cost, create an order, poll its status and withdraw what nobody claimed.",
    url: "/docs",
  },
};

const toc = [
  {
    part: "Start here",
    items: [
      { id: "overview", label: "Overview" },
      { id: "settlement", label: "Where funds sit" },
    ],
  },
  {
    part: "Agent guide",
    items: [
      { id: "quickstart", label: "Quickstart" },
      { id: "keys", label: "Wallets and keys" },
      { id: "balances", label: "Balances" },
      { id: "platforms", label: "Platforms and recipients" },
      { id: "routes", label: "Funding routes" },
      { id: "preview", label: "Preview and cost" },
      { id: "create", label: "Create an order" },
      { id: "identifiers", label: "Identifiers" },
      { id: "status", label: "Status and partial fills" },
      { id: "expiry", label: "Expiry and cancellation" },
      { id: "recovery", label: "Recovery and withdrawal" },
      { id: "errors", label: "Errors" },
    ],
  },
  {
    part: "Human guide",
    items: [
      { id: "humans", label: "How people fill orders" },
      { id: "lifecycle", label: "Lifecycle" },
      { id: "web-claims", label: "Web claim links" },
    ],
  },
  {
    part: "Reference",
    items: [
      { id: "verification", label: "Verification limits" },
      { id: "project", label: "Project status" },
      { id: "machine-readable", label: "For machines" },
    ],
  },
];

function Note({ children, warn = false }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <div className={`note mt-5 ${warn ? "note-warn" : ""}`}>
      <span className="label !text-ink pt-[3px]">{warn ? "Risk" : "Note"}</span>
      <div>{children}</div>
    </div>
  );
}

function Code({ title, children, lang }: { title: string; children: string; lang?: string }) {
  return (
    <div className="mt-4">
      <CodeBlock title={title} lang={lang}>
        {children}
      </CodeBlock>
    </div>
  );
}

function currencies(list: string[]) {
  return list.length <= 4 ? list.join(", ") : `${list.slice(0, 3).join(", ")} and ${list.length - 3} more`;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "PayHumans documentation",
  description: "How an AI agent funds, tracks and recovers a human-executed fiat payment order with the payhumans CLI.",
  url: `${SITE.url}/docs`,
  dateModified: SITE.reviewed,
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navigation />
      <main className="flex-1 pt-12 md:pt-16 pb-24">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[208px_minmax(0,1fr)] gap-12 lg:gap-16">
          <aside className="hidden lg:block">
            <nav className="toc sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6" aria-label="Docs sections">
              {toc.map((group) => (
                <div key={group.part} className="mb-6">
                  <p className="label mb-2.5">{group.part}</p>
                  {group.items.map((t) => (
                    <a key={t.id} href={`#${t.id}`}>
                      {t.label}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <article className="docs min-w-0 max-w-[46rem]">
            <header>
              <p className="label mb-4">Documentation</p>
              <h1 className="text-[clamp(2.125rem,4.6vw,3.25rem)] font-medium tracking-[-0.035em] leading-[1.04]">
                Fund an order, <span className="pen">get a person paid.</span>
              </h1>
              <p className="lede mt-5">
                Everything an agent needs to turn crypto into a fiat payment made by a
                person: what to install, what it costs, what the IDs mean, and how to get
                unclaimed funds back.
              </p>
              <p className="small mt-4">
                Reading this as an agent? The same content is in plain text at{" "}
                <a href={LINKS.llmsFull} className="font-mono text-[12.5px]">
                  /llms-full.txt
                </a>
                .
              </p>

              <details className="lg:hidden mt-8 border border-rule rounded-lg">
                <summary className="px-4 py-3 text-[14.5px] font-medium cursor-pointer">On this page</summary>
                <nav className="toc px-4 pb-4" aria-label="Docs sections">
                  {toc.flatMap((g) => g.items).map((t) => (
                    <a key={t.id} href={`#${t.id}`}>
                      {t.label}
                    </a>
                  ))}
                </nav>
              </details>
            </header>

            {/* ---------- Start here ---------- */}
            <section id="overview" className="docs-section">
              <h2>Overview</h2>
              <p>
                PayHumans turns a payment an agent wants made into an order a person can
                fill. The agent locks crypto in escrow and states the terms: who gets paid,
                on which payment platform, in which currency, and at what rate. A person
                claims the order, sends the fiat from their own account, proves the payment,
                and receives the crypto.
              </p>
              <p>
                Two things move, in two places. Crypto moves on-chain between the agent, the
                escrow contract and the person who pays. Fiat moves off-chain, from that
                person&apos;s payment account to the recipient. A proof of the fiat payment
                is the only thing that connects them.
              </p>
              <Note>
                <p>
                  <strong>Creating an order does not pay anyone.</strong> It puts crypto in
                  escrow and waits for a person. Treat the recipient as paid only when the
                  order reports a fulfilled claim. See{" "}
                  <a href="#status">Status and partial fills</a>.
                </p>
              </Note>
            </section>

            <section id="settlement" className="docs-section">
              <h2>Where funds sit</h2>
              <p>Every order settles the same way, whatever it was funded with.</p>
              <ul className="prose-list">
                <li>
                  <strong>The escrow is on {SETTLEMENT.chain}.</strong> Orders are deposits in
                  Peer&apos;s production escrow contract on {SETTLEMENT.chain} (chain ID{" "}
                  {SETTLEMENT.chainId}). PayHumans deploys no contracts of its own.
                </li>
                <li>
                  <strong>The escrow holds {SETTLEMENT.asset}.</strong> Specifically{" "}
                  {SETTLEMENT.asset} on {SETTLEMENT.chain}, <code>{SETTLEMENT.usdcAddress}</code>.
                </li>
                <li>
                  <strong>Other assets are converted first.</strong> Funding from another
                  chain or asset means a swap or bridge into {SETTLEMENT.asset} on{" "}
                  {SETTLEMENT.chain}, carried out by a routing provider before the deposit.
                  There is no escrow on Solana, Ethereum or Bitcoin.
                </li>
                <li>
                  <strong>The order belongs to your Base account.</strong> With an EVM key,
                  that is the key&apos;s own address. With a Solana key, the CLI derives a
                  Base account from the key, so the agent still manages one secret. Keep
                  that key: it is the only way to withdraw.
                </li>
                <li>
                  <strong>PayHumans never holds funds or keys.</strong> The CLI signs
                  locally. Between the route and the deposit, funds sit in your own Base
                  account.
                </li>
              </ul>
              <div className="mt-7">
                <FundingRouteDiagram />
              </div>
            </section>

            {/* ---------- Agent guide ---------- */}
            <section id="quickstart" className="docs-section">
              <div className="docs-part">
                <span className="sq" aria-hidden="true" />
                <span className="label">Agent guide</span>
              </div>
              <h2>Quickstart</h2>
              <p>
                The <code>{CLI.packageName}</code> package installs one executable,{" "}
                <code>{CLI.bin}</code>. It needs Node.js {CLI.node} or newer. Results are
                JSON on stdout; errors are JSON on stderr with a non-zero exit code.
              </p>
              <div className="mt-5">
                <InstallChip command={CLI.install} />
              </div>
              <Code title="the whole flow">{CLI_QUICKSTART}</Code>
              <p className="mt-5">
                Every command that spends is a preview until you pass <code>--yes</code>.
                The sections below cover each step. <code>{CLI.bin} --help</code> and{" "}
                <code>{CLI.bin} &lt;command&gt; --help</code> are the authority for the
                version you installed.
              </p>
            </section>

            <section id="keys" className="docs-section">
              <h2>Wallets and keys</h2>
              <p>
                The agent uses a wallet it already controls. There is no account to create,
                no API key, and no hosted wallet. Give the CLI one signing key through your
                secret manager, for the chain you fund from.
              </p>
              <div className="table-scroll mt-5">
                <table className="table min-w-[560px]">
                  <thead>
                    <tr>
                      <th scope="col">Variable</th>
                      <th scope="col">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENV_VARS.map((v) => (
                      <tr key={v.name}>
                        <td className="font-mono text-[12.5px] whitespace-nowrap !font-normal">{v.name}</td>
                        <td className="text-[14px] leading-normal">{v.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Note warn>
                <p>
                  Never put a key in a command argument, a prompt, a log, or this website.
                  The CLI reads keys only from the environment or a key file, and redacts
                  them from its error output.
                </p>
              </Note>
              <p className="mt-5">
                The browser login on payhumans.ai is separate and optional. It exists for
                people recovering a claim made on this site, and agents never need it.
              </p>
            </section>

            <section id="balances" className="docs-section">
              <h2>Balances</h2>
              <p>
                <code>{CLI.bin} wallet</code> prints two things: the balance of the asset
                you fund from, and your Base account with its USDC and ETH. Pass the source
                you plan to use.
              </p>
              <Code title="balances">{CLI_COMMANDS.wallet}</Code>
              <ul className="prose-list">
                <li>
                  The funding wallet needs the asset itself plus that chain&apos;s network
                  fee: a little SOL on Solana, a little ETH on an EVM chain.
                </li>
                <li>
                  The Base account needs a little ETH for the approval and the deposit.
                  When you fund from another chain the CLI buys a small amount through the
                  route if the balance is low. When you fund from Base, or with bitcoin,
                  it must already hold ETH: the CLI checks for at least 0.00002, and the
                  transactions can cost more than that.
                </li>
                <li>
                  USDC already in your Base account is used first. Only the shortfall is
                  routed from your funding wallet.
                </li>
              </ul>
            </section>

            <section id="platforms" className="docs-section">
              <h2>Platforms and recipients</h2>
              <p>
                An order names one payment platform, one fiat currency and one recipient.
                Ask the CLI what is supported rather than hard-coding it; the catalog
                changes.
              </p>
              <p>
                Keep three sets apart. {PLATFORM_SETS.catalog} platforms are in the Peer
                catalog and can be named in an order. {PLATFORM_SETS.inApp.length} of them
                can be filled in the Peer mobile app. {PLATFORM_SETS.alerts.length} of
                those can be chosen in the app&apos;s order alerts.
              </p>
              <Code title="discover">{CLI_COMMANDS.discover}</Code>

              <h3>Recipient identifiers</h3>
              <p>
                Each platform identifies a recipient differently, and some need a one-time
                step before they can receive. This table reflects Peer&apos;s rules on{" "}
                {SITE.reviewed}; <code>{CLI.bin} platforms</code> is the authority.
              </p>
              <div className="table-scroll mt-5">
                <table className="table min-w-[760px]">
                  <thead>
                    <tr>
                      <th scope="col">Platform</th>
                      <th scope="col">Recipient is a</th>
                      <th scope="col">Before the first order</th>
                      <th scope="col">In Peer app</th>
                      <th scope="col">Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLATFORMS.map((p) => (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap">
                          {p.name}
                          <span className="block font-mono text-[11.5px] font-normal text-ink-3 mt-0.5">{p.id}</span>
                        </td>
                        <td className="text-[14px] leading-normal">
                          {p.recipient}
                          <span className="block text-[12.5px] text-ink-3 mt-0.5">{currencies(p.currencies)}</span>
                        </td>
                        <td className="text-[14px] leading-normal">{p.setup}</td>
                        <td className="whitespace-nowrap text-[13.5px]">{APP_SUPPORT[p.inPeerApp]}</td>
                        <td className="whitespace-nowrap text-[13.5px]">{p.alerts ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small mt-3">
                &ldquo;In Peer app&rdquo; says whether people can fill orders on that platform
                in the Peer mobile app. &ldquo;Newer versions&rdquo; ({listOf(PLATFORM_SETS.inAppNewer)})
                means support is in the app&apos;s current source but we have not confirmed
                it in the store build. An order on a platform marked &ldquo;No&rdquo;
                ({listOf(PLATFORM_SETS.notInApp)}) can be created, but cannot be filled
                through the current Peer mobile app; other Peer surfaces may differ.
                &ldquo;Alerts&rdquo; says whether the app&apos;s opt-in order alerts can be
                set for that platform. All of this comes from the app&apos;s source and
                has not been observed on a production device.
              </p>

              <h3>Validate and register</h3>
              <p>
                Check a recipient before you fund anything. Registering stores the
                recipient&apos;s payment details with Peer so the app can show them to
                whoever claims; it moves no crypto. <code>deposit create --yes</code>{" "}
                registers for you if you skip this.
              </p>
              <Code title="recipient">{CLI_COMMANDS.recipient}</Code>
              <Note warn>
                <p>
                  Validation checks the format, and on some platforms that the profile
                  exists. It never proves the handle belongs to the person you mean to pay.
                  Confirm the exact identifier with the recipient; fiat sent to a wrong
                  handle is gone.
                </p>
              </Note>

              <h3>Wise, PayPal and Alipay need the recipient&apos;s help</h3>
              <p>
                On these platforms a recipient Peer has not seen before must prove they own
                the account, once, in a desktop browser with the Peer extension. The pages
                are{" "}
                <a href={LINKS.peerRegisterWise} target="_blank" rel="noopener noreferrer">
                  app.peer.xyz/sell/wise
                </a>
                ,{" "}
                <a href={LINKS.peerRegisterPaypal} target="_blank" rel="noopener noreferrer">
                  app.peer.xyz/sell/paypal
                </a>{" "}
                and, for Alipay,{" "}
                <a href={LINKS.peerRegisterRecipient} target="_blank" rel="noopener noreferrer">
                  app.peer.xyz/sell
                </a>{" "}
                (see{" "}
                <a href={LINKS.peerSellerGuide} target="_blank" rel="noopener noreferrer">
                  Peer&apos;s seller guide
                </a>
                ). An agent cannot do this for them. Until it is done, the CLI stops with{" "}
                <code>RECIPIENT_REGISTRATION_REQUIRED</code> before any funds move. A
                recipient who is already verified can be reused.
              </p>
            </section>

            <section id="routes" className="docs-section">
              <h2>Funding routes</h2>
              <p>
                You choose what to fund with using <code>--source-chain</code> and{" "}
                <code>--source-asset</code>. The default is USDC on Solana. The CLI converts
                to {SETTLEMENT.asset} on {SETTLEMENT.chain} through a routing provider
                (Relay) and refuses a source it cannot route before anything is sent.
                These are the routes the CLI implements; only one has funded a real order.
              </p>
              <div className="mt-6">
                <RouteTable />
              </div>
              <RouteLegend />
              <ul className="prose-list mt-6">
                <li>
                  <strong>A listed route still needs a live quote.</strong> Availability,
                  minimum size and fees are decided when you preview, not by this table.
                </li>
                <li>
                  <strong>Native bitcoin works differently.</strong> The CLI holds no
                  Bitcoin key. It returns a deposit address, an exact amount and a deadline
                  from the provider (NEAR Intents); you send BTC once from your own wallet,
                  then resume the operation. It needs <code>--refund-address</code>, an EVM
                  key to own the order, and ETH on Base for gas. The provider&apos;s minimum
                  varies: a quote for a 5 USDC order was rejected and one for 10 USDC
                  succeeded. Your Bitcoin network fee is extra, and a failed route may
                  refund less than you sent. Never send after the deadline, or twice. This
                  route has not been tested with real funds.
                </li>
                <li>
                  <strong>Wrapped bitcoin is not bitcoin.</strong> WBTC, cbBTC and similar
                  tokens are separate assets and are not accepted.
                </li>
              </ul>
            </section>

            <section id="preview" className="docs-section">
              <h2>Preview and cost</h2>
              <p>
                Run <code>deposit create</code> without <code>--yes</code>. With a key
                configured, the CLI checks the recipient&apos;s format, fetches a live route
                quote, and prints the plan. With no key it prints the terms only. Either
                way nothing is registered, signed or sent.
              </p>
              <Code title="preview">{CLI_COMMANDS.preview}</Code>
              <Code title="another source">{CLI_COMMANDS.previewOtherSource}</Code>

              <h3>What an order costs you</h3>
              <div className="table-scroll mt-4">
                <table className="table min-w-[560px]">
                  <thead>
                    <tr>
                      <th scope="col">Cost</th>
                      <th scope="col">What it is</th>
                      <th scope="col">In the preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="whitespace-nowrap">The rate</td>
                      <td className="text-[14px] leading-normal">
                        <code>--amount</code> is the gross USDC in escrow, and{" "}
                        <code>--rate</code> is fiat sent per USDC of escrow claimed. At 0.98,
                        a claim of 5 USDC asks for $4.90, rounded up to a cent.
                      </td>
                      <td className="font-mono text-[12.5px]">fiatForFullDeposit</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap">Route fee</td>
                      <td className="text-[14px] leading-normal">
                        The routing provider&apos;s charge to convert your asset to USDC on
                        Base. Zero when you fund with USDC on Base.
                      </td>
                      <td className="font-mono text-[12.5px]">routes.funding</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap">Network fees</td>
                      <td className="text-[14px] leading-normal">
                        Gas on the source chain, and on Base for the approval and deposit.
                      </td>
                      <td className="font-mono text-[12.5px]">routes.gas, caps</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                <code>totalSourceInput</code> is what the route takes from your funding
                wallet, in the source asset, with the route&apos;s fees included. Network gas
                you pay directly is on top of it.
              </p>
              <p>
                Peer&apos;s own fees are not yours to pay. They are taken from the USDC the
                person claims, so someone who claims 5 USDC receives a little less than 5.
                The Peer app shows them the exact net amount before they commit.
              </p>

              <h3>Limits you set</h3>
              <p>
                The CLI stops before signing if a quote exceeds any limit.{" "}
                <code>--max-source-spend</code> is required to execute; the others have
                defaults.
              </p>
              <dl className="rows mt-4">
                {SPEND_CAPS.map((c) => (
                  <div key={c.flag} className="grid sm:grid-cols-[190px_minmax(0,1fr)] gap-x-5 gap-y-1 py-3.5">
                    <dt>
                      <code>{c.flag}</code>
                    </dt>
                    <dd className="text-[14.5px] leading-[1.55] text-ink-2">{c.bounds}</dd>
                  </div>
                ))}
              </dl>
              <Note warn>
                <p>
                  <strong>The limits do not cover every cost.</strong> These are extra:
                </p>
                <ul className="prose-list">
                  {UNCAPPED_COSTS.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  Leave a small margin for them. Each limit also covers one order only, so
                  keep your own budget across orders.
                </p>
              </Note>
            </section>

            <section id="create" className="docs-section">
              <h2>Create an order</h2>
              <p>
                Repeat the command you previewed and add three things: an operation ID you
                choose, a source spend limit, and <code>--yes</code>.
              </p>
              <Code title="create">{CLI_COMMANDS.create}</Code>
              <p className="mt-5">In order, the CLI then:</p>
              <ol className="prose-list">
                <li>Validates and registers the recipient, and prepares the deposit. No funds have moved yet.</li>
                <li>Runs the route: your asset becomes USDC in your Base account.</li>
                <li>Approves the escrow for exactly the order amount.</li>
                <li>Creates the deposit and reads its ID from the transaction receipt.</li>
                <li>
                  Turns off Peer&apos;s dispute protection for the order&apos;s platform. That
                  removes the stake a person would otherwise have to post to claim, and
                  nothing else: Peer&apos;s other eligibility rules still apply. You accept
                  the risk of a payment being reversed after release. Pass{" "}
                  <code>--require-stake</code> to keep it on.
                </li>
              </ol>
              <p className="mt-4">
                The result includes <code>depositId</code>, <code>compositeDepositId</code>,{" "}
                <code>transactionHash</code>, each route&apos;s <code>requestId</code> and
                status, and a <code>claimUrl</code>.
              </p>

              <h3>Orders several people can fill</h3>
              <p>
                <code>--min</code> and <code>--max</code> set the smallest and largest single
                claim, in gross USDC. By default a claim can be anything from 1 USDC up to
                the whole order. Each claim is a separate fiat payment, so the recipient may receive
                several smaller payments instead of one.
              </p>
              <Code title="partial fills">{CLI_COMMANDS.partial}</Code>

              <h3>All flags</h3>
              <div className="table-scroll mt-4">
                <table className="table min-w-[640px]">
                  <thead>
                    <tr>
                      <th scope="col">Flag</th>
                      <th scope="col">Needed</th>
                      <th scope="col">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CREATE_FLAGS.map((f) => (
                      <tr key={f.flag}>
                        <td className="font-mono text-[12.5px] !font-normal">{f.flag}</td>
                        <td className="text-[13px] leading-normal whitespace-nowrap">{f.required}</td>
                        <td className="text-[14px] leading-normal">{f.meaning.replace(/`/g, "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="identifiers" className="docs-section">
              <h2>Identifiers</h2>
              <p>Five IDs appear in the output. Store them all with your record of the payment.</p>
              <div className="table-scroll mt-4">
                <table className="table min-w-[560px]">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Comes from</th>
                      <th scope="col">Use it to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IDENTIFIERS.map((i) => (
                      <tr key={i.name}>
                        <td className="font-mono text-[12.5px] !font-normal">{i.name}</td>
                        <td className="text-[14px] leading-normal">{i.from.replace(/`/g, "")}</td>
                        <td className="text-[14px] leading-normal">{i.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="status" className="docs-section">
              <h2>Status and partial fills</h2>
              <p>
                <code>deposit show</code> needs no key. It reports where the order&apos;s
                USDC is right now and lists every claim.
              </p>
              <Code title="status">{CLI_COMMANDS.status}</Code>
              <div className="mt-6">
                <BalanceDiagram />
              </div>
              <ul className="prose-list mt-6">
                <li>
                  <strong>A claim is not a payment.</strong> A claim in the{" "}
                  <code>SIGNALED</code> state is a reservation. Only <code>FULFILLED</code>{" "}
                  means the escrow released USDC against a verified fiat payment.
                </li>
                <li>
                  <strong>Fiat delivered so far</strong> is about <code>fulfilled</code>{" "}
                  multiplied by your rate; each claim&apos;s fiat amount is rounded up to a
                  cent. For proof of one payment, read that claim&apos;s receipt fields
                  under <code>intents</code>.
                </li>
                <li>
                  <strong>Amounts are gross.</strong> <code>fulfilled</code> is what left
                  escrow. The people who paid received that less Peer&apos;s fees.
                </li>
                <li>
                  <strong>Two sources, two speeds.</strong> <code>available</code> and{" "}
                  <code>reserved</code> are read from the chain. <code>funded</code>,{" "}
                  <code>fulfilled</code>, <code>withdrawn</code> and <code>intents</code> come
                  from Peer&apos;s indexer and can trail by a short time. If{" "}
                  <code>indexed</code> is false, the indexed fields are null rather than
                  zero, and only the chain values are present.
                </li>
                <li>
                  <strong>Polling.</strong> Once a minute is plenty. An order is finished
                  when <code>available</code> and <code>reserved</code> are both zero.
                </li>
              </ul>
            </section>

            <section id="expiry" className="docs-section">
              <h2>Expiry and cancellation</h2>
              <ul className="prose-list">
                <li>
                  A claim reserves USDC for a limited window set by Peer. Its expiry time is
                  on the claim.
                </li>
                <li>
                  The person can cancel a claim they have not paid. The reserved USDC
                  becomes available again.
                </li>
                <li>
                  If the window passes without a valid proof, the claim is no longer
                  valid. Its USDC may still show as reserved until Peer clears the expired
                  claim; after that it can be claimed again or withdrawn. Check the
                  claim&apos;s status before acting.
                </li>
                <li>
                  The agent cannot cancel someone else&apos;s active claim, and should not
                  try to work around one: that person may already have sent the fiat.
                </li>
                <li>An order itself does not expire. It stays open until it is filled or you withdraw.</li>
              </ul>
              <div className="mt-7">
                <StateDiagram />
              </div>
            </section>

            <section id="recovery" className="docs-section">
              <h2>Recovery and withdrawal</h2>

              <h3>An interrupted run</h3>
              <p>
                The CLI keeps a local journal in <code>{JOURNAL.path}</code> (override
                with <code>PAYHUMANS_STATE_DIR</code>). If a run crashes or a route is
                slow, resume it from there.
              </p>
              <Code title="operations">{CLI_COMMANDS.operations}</Code>
              <ul className="prose-list">
                {JOURNAL.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <Note warn>
                <p>
                  <strong>The journal is the protection, not the ID alone.</strong> If
                  funds have already left your wallet and the journal is gone, or you pick
                  a new ID, the CLI can fund a second order. When unsure, read{" "}
                  <code>operations show</code>, check the route and transaction it lists,
                  and resume.
                </p>
              </Note>

              <h3>Take back unclaimed funds</h3>
              <p>
                <code>deposit withdraw</code> removes available USDC from the order (all of
                it unless you pass <code>--amount</code>) and sends it to your Base
                account. It never touches reserved USDC and never cancels a claim.
              </p>
              <p>
                The command signs with the wallet selected by <code>--source-chain</code>{" "}
                and <code>--source-asset</code>. The default is the Solana key, so pass the
                same source you funded with.
              </p>
              <Code title="withdraw">{CLI_COMMANDS.withdraw}</Code>

              <h3>Send it home</h3>
              <p>
                After a withdrawal the USDC is in your Base account. With an EVM key, that
                is already your wallet. With a Solana key, <code>return</code> routes it
                back to the same Solana wallet as USDC;{" "}
                <code>--min-receive</code> is required and bounds fees and slippage. There
                is no route back to bitcoin.
              </p>
              <Code title="return">{CLI_COMMANDS.returnFunds}</Code>

              <h3>Remove the stake requirement</h3>
              <p>
                If dispute protection is still on for an order, people must post stake to
                claim it. <code>deposit open-claims</code> turns it off for one platform on
                one order. It removes that stake requirement only; Peer&apos;s other
                eligibility rules still apply.
              </p>
              <Code title="open claims">{CLI_COMMANDS.openClaims}</Code>
            </section>

            <section id="errors" className="docs-section">
              <h2>Errors</h2>
              <p>
                A failed command exits non-zero and writes one JSON object to stderr.
                Stdout carries only successful results, so it is safe to parse.
              </p>
              <Code title="stderr" lang="json">{`{
  "error": {
    "code": "RECIPIENT_REGISTRATION_REQUIRED",
    "message": "...",
    "next": "..."
  }
}`}</Code>
              <ul className="prose-list">
                <li>
                  <code>INVALID_ARGUMENT</code>: a flag is missing or malformed. Nothing
                  was sent.
                </li>
                <li>
                  <code>RECIPIENT_REGISTRATION_REQUIRED</code>: the recipient must complete
                  Peer&apos;s one-time verification. Nothing was sent. Retry the same
                  operation ID afterwards.
                </li>
                <li>
                  <code>REQUEST_FAILED</code>: anything else. Read <code>message</code>; if a
                  run with <code>--yes</code> had started, inspect the operation before
                  retrying.
                </li>
              </ul>
            </section>

            {/* ---------- Human guide ---------- */}
            <section id="humans" className="docs-section">
              <div className="docs-part">
                <span className="ci" aria-hidden="true" />
                <span className="label">Human guide</span>
              </div>
              <h2>How people fill orders</h2>
              <p>
                An order is an ordinary Peer deposit, so people fill it in the{" "}
                <Link href={LINKS.earn}>Peer mobile app</Link>, from its P2P tab or Buy USDC flow. From
                their side they are buying USDC at your rate by paying your recipient.
                There is no PayHumans account, and nothing to enrol in beyond the app
                itself. This workflow is taken from the app&apos;s current source; we have
                not yet observed it on a production device.
              </p>
              <ol className="prose-list">
                <li>They choose a currency and a payment platform they already use.</li>
                <li>The app lists open orders by price. They pick one and claim some or all of it.</li>
                <li>They send the exact fiat amount to the recipient shown, from their own account.</li>
                <li>They verify the payment inside the app. The escrow releases the USDC to them, less Peer&apos;s fees.</li>
              </ol>
              <Note>
                <p>
                  <strong>Nobody is guaranteed to see your order.</strong>{" "}
                  {DISCOVERY.visibility}
                </p>
                <p className="mt-3">
                  {DISCOVERY.alerts} A small order can sit unclaimed.
                </p>
              </Note>
              <p className="mt-5">
                {PLATFORM_SETS.inApp.length} platforms can be filled in the app:{" "}
                {listOf(PLATFORM_SETS.inAppConfirmed)}, and in newer versions{" "}
                {listOf(PLATFORM_SETS.inAppNewer)}. UPI payments are proved through Amazon
                Pay, and Zelle payments from Bank of America or Citi.
              </p>
              <p>
                The full walkthrough for people, with download links, is at{" "}
                <Link href={LINKS.earn}>/earn</Link>.
              </p>
            </section>

            <section id="lifecycle" className="docs-section">
              <h2>Lifecycle</h2>
              <p>Who does what, in order. Blue cells are a person&apos;s actions.</p>
              <div className="mt-6">
                <LifecycleDiagram />
              </div>
            </section>

            <section id="web-claims" className="docs-section">
              <h2>Web claim links</h2>
              <p>
                The CLI returns a <code>claimUrl</code> of the form{" "}
                <code>payhumans.ai/earn?deposit=&lt;id&gt;</code>. It opens{" "}
                <Link href={LINKS.recover}>the claim page</Link>, which shows that
                order&apos;s live terms read from the escrow. Share it with a person so
                they can check the recipient, amount and rate before they look for the
                order in the Peer app.
              </p>
              <p>
                The same page keeps the original browser flow working: sign in with email
                or a passkey, claim, and verify with the Peer browser extension. Claims
                made that way, and their <code>?intent=</code> and <code>?claimTx=</code>{" "}
                links, can still be reopened, verified or cancelled there.
              </p>
            </section>

            {/* ---------- Reference ---------- */}
            <section id="verification" className="docs-section">
              <div className="docs-part">
                <span className="label">Reference</span>
              </div>
              <h2>Verification limits</h2>
              <p>
                Payment verification is done by Peer&apos;s verification service and escrow
                contract, not by PayHumans. It has limits worth knowing.
              </p>
              <ul className="prose-list">
                <li>Only supported platforms and currencies can be proved, and support differs between them.</li>
                <li>The proof must match the claim: recipient, amount, currency, and a payment made after the claim.</li>
                <li>
                  A proof shows a payment left the person&apos;s account. It does not cover
                  later reversals, disputes or holds by the payment platform.
                </li>
                <li>Changes on a payment platform can temporarily break verification for it.</li>
              </ul>
            </section>

            <section id="project" className="docs-section">
              <h2>Project status</h2>
              <p>
                PayHumans is new. This is what has run with real funds and what has not.
                Start with small amounts.
              </p>
              <div className="mt-6">
                <VerifiedLedger heading={false} />
              </div>
              <h3>What is and is not PayHumans</h3>
              <p>
                PayHumans.ai is an independent project. It began as a website prototype on
                March 27, 2026. The CLI, the live escrow integration and this site were
                built from October 2, 2026 onward.
              </p>
              <p>
                The escrow contracts, payment verification, SDKs and mobile app are{" "}
                <a href={LINKS.peer} target="_blank" rel="noopener noreferrer">
                  Peer
                </a>
                &apos;s existing infrastructure, not new work by PayHumans. Routing is
                provided by Relay, and by NEAR Intents for the experimental bitcoin route.
                Privy provides the optional browser login on the claim page.
              </p>
              <p>
                Prepared for{" "}
                <a href={LINKS.buildLab} target="_blank" rel="noopener noreferrer">
                  Chiang Mai Build Lab
                </a>
                .
              </p>
            </section>

            <section id="machine-readable" className="docs-section">
              <h2>For machines</h2>
              <ul className="prose-list">
                <li>
                  <a href={LINKS.llms} className="font-mono text-[13.5px]">/llms.txt</a>: a short index with the rules that matter.
                </li>
                <li>
                  <a href={LINKS.llmsFull} className="font-mono text-[13.5px]">/llms-full.txt</a>: this documentation as one Markdown file.
                </li>
                <li>
                  <a href={LINKS.agentGuide} className="font-mono text-[13.5px]">/agent-guide.json</a>: commands, flags, environment variables, routes and platforms as JSON.
                </li>
              </ul>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
