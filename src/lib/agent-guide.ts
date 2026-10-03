/*
  Plain-text and JSON versions of the docs for agents:
  /llms.txt, /llms-full.txt and /agent-guide.json all render from here,
  using the same facts as the HTML pages (src/lib/constants.ts).
*/
import {
  APP_SUPPORT,
  BALANCES,
  CLI,
  CLI_COMMANDS,
  CLI_QUICKSTART,
  CREATE_FLAGS,
  DISCOVERY,
  ENV_VARS,
  FUNDING_ROUTES,
  JOURNAL,
  LINKS,
  PLATFORMS,
  PLATFORM_SETS,
  ROUTE_STATUS,
  SETTLEMENT,
  SITE,
  SPEND_CAPS,
  UNCAPPED_COSTS,
  VERIFICATION,
  listOf,
  registrationUrl,
} from "./constants";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);
const code = (body: string, lang = "sh") => `\`\`\`${lang}\n${body}\n\`\`\``;
const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

/* The rules an agent must hold before it spends anything. */
export const AGENT_RULES = [
  "Creating an order does not pay the recipient. It puts crypto in escrow and waits for a person. Only a claim in the FULFILLED state means a fiat payment was verified and USDC was released.",
  "Every command that spends is a preview until you pass `--yes`. Preview first and read `totalSourceInput`, `routes` and `fiatForFullDeposit` (amount times rate: the fiat the recipient gets if the whole order fills).",
  "Signed crypto writes require `--operation-id`. `deposit create --yes` also requires `--max-source-spend`; `return --yes` requires `--min-receive`. Recipient registration moves no crypto and needs no operation ID. Reuse the same operation ID on every retry; a new ID is a new payment.",
  `Retry protection depends on the local journal in \`${JOURNAL.path}\`. Keep that directory and back it up, and do not use the same wallet from another process or tool while an operation is in flight. Without the journal the CLI cannot tell what was already sent.`,
  "The limits bound the route and execution gas, not every cost. L1 data fees, Solana account rent and your own Bitcoin transaction fee are extra. Each limit covers one order, so keep your own total budget. Gas caps are checked against prepared transactions during execution; a preview is not a full gas estimate, and earlier confirmed steps can remain spent if a later step is blocked.",
  "Keys come only from the environment: `PAYHUMANS_SOLANA_KEY` or `PAYHUMANS_EVM_KEY`, or their `_FILE` variants. Never put a key in a command argument, a prompt or a log. No account, API key or Privy login is needed.",
  `Whatever you fund with is converted to ${SETTLEMENT.asset} on ${SETTLEMENT.chain} before the deposit. The escrow is Peer's contract on ${SETTLEMENT.chain}. There is no escrow on Solana, Ethereum or Bitcoin.`,
  "Funded mainnet tests cover Solana USDC/SOL, Ethereum ETH, Base ETH and external-wallet native BTC. Other implemented routes remain untested with funds. A successful quote alone is not a funded test. Wrapped BTC is not accepted.",
  "Recipient validation checks format, not ownership. Confirm the exact handle with the recipient. Fiat sent to a wrong handle cannot be recovered.",
  `Nobody is guaranteed to see or fill an order. ${PLATFORM_SETS.catalog} platforms can be named in an order, but only ${PLATFORM_SETS.inApp.length} can be filled in the Peer mobile app. Unclaimed funds can be withdrawn at any time. You cannot cancel another person's active claim, and should not try to: they may already have sent fiat.`,
  "Real fiat payment, proof and payout remain unverified in these PayHumans tests. Start with small amounts.",
];

export const IDENTIFIERS = [
  {
    name: "operationId",
    from: "You choose it. One per payment; 1 to 80 letters, digits, hyphens or underscores.",
    use: "Retry or resume. While its local journal exists, the same ID resumes the saved operation instead of starting a new payment.",
  },
  {
    name: "depositId",
    from: "The escrow contract, when the deposit is created.",
    use: "Read status and withdraw.",
  },
  {
    name: "compositeDepositId",
    from: "The escrow address and deposit ID joined by an underscore.",
    use: "Refer to the order unambiguously in Peer's APIs and app.",
  },
  {
    name: "intent hash",
    from: "Each claim a person makes. Listed under `intents` in `deposit show`.",
    use: "Tell claims apart and see which were fulfilled.",
  },
  {
    name: "requestId",
    from: "The routing provider, one per swap or bridge.",
    use: "Reconcile a slow or failed route before retrying.",
  },
];

export const ERROR_CODES = [
  { code: "OPERATION_NOT_FOUND", meaning: "No saved journal exists for that ID in the current state directory. Run operations list and confirm PAYHUMANS_STATE_DIR points to the original journal. If funds may already have moved, reconcile the original transaction before creating a new operation." },
  { code: "INVALID_ARGUMENT", meaning: "A flag is missing or malformed. Nothing was sent." },
  {
    code: "RECIPIENT_REGISTRATION_REQUIRED",
    meaning: "The recipient must complete Peer's one-time verification. Nothing was sent. Retry the same operation ID afterwards.",
  },
  {
    code: "REQUEST_FAILED",
    meaning: "Anything else. Read `message`. If a run with --yes had started, inspect the operation before retrying.",
  },
];

function routesTable() {
  return table(
    ["Fund with", "On", "Status", "Notes"],
    FUNDING_ROUTES.map((r) => [r.asset, r.chain, ROUTE_STATUS[r.status].label, r.note]),
  );
}

export function llmsTxt(): string {
  return `# ${SITE.name}

> ${SITE.description} Agents use the \`${CLI.bin}\` CLI (npm package \`${CLI.packageName}\`, Node.js ${CLI.node} or newer). Orders settle as ${SETTLEMENT.asset} on ${SETTLEMENT.chain} in Peer's escrow contract. People fill orders in the Peer mobile app.

Rules to hold before you spend anything:

${AGENT_RULES.map((r) => `- ${r}`).join("\n")}

## Quickstart

${code(CLI_QUICKSTART)}

Results are JSON on stdout. Errors are JSON on stderr with a non-zero exit code. \`${CLI.bin} --help\` is the authority for the version you installed.

## Agent docs

- [Full agent guide](${abs(LINKS.llmsFull)}): the complete documentation as one Markdown file. Read this before creating an order.
- [Machine-readable reference](${abs(LINKS.agentGuide)}): commands, flags, environment variables, funding routes and platforms as JSON.
- [Quickstart](${abs("/docs#quickstart")}): install and run the whole flow.
- [Wallets and keys](${abs("/docs#keys")}): environment variables; no account needed.
- [Balances](${abs("/docs#balances")}): what the funding wallet and the Base account must hold.
- [Platforms and recipients](${abs("/docs#platforms")}): recipient identifier formats, validation, and which platforms need the recipient to register first.
- [Funding routes](${abs("/docs#routes")}): which crypto can fund an order, and which routes are tested.
- [Preview and cost](${abs("/docs#preview")}): source spend, route fees, network fees and the limits you set.
- [Create an order](${abs("/docs#create")}): required flags, what happens in order, partial fills.
- [Identifiers](${abs("/docs#identifiers")}): operation ID, deposit ID, intent hash, route request ID.
- [Status and partial fills](${abs("/docs#status")}): available, reserved, fulfilled, withdrawn; polling.
- [Expiry and cancellation](${abs("/docs#expiry")}): what happens to a claim that is not paid.
- [Recovery and withdrawal](${abs("/docs#recovery")}): resume an interrupted run, withdraw unclaimed funds, return them to Solana.
- [Errors](${abs("/docs#errors")}): error codes and what each means for retries.

## Human docs

- [Fill orders with the Peer app](${abs(LINKS.earn)}): how a person finds, claims, pays and verifies an order; download links; how alerts work.
- [Claim page](${abs(LINKS.recover)}): look up an order by deposit ID, or recover a claim made in the browser. The CLI's \`claimUrl\` opens it.

## Optional

- [npm package](${LINKS.npm}): ${CLI.packageName}
- [Project status](${abs("/docs#project")}): what has and has not been verified with real funds.
- [Peer](${LINKS.peer}): the protocol that provides escrow, payment verification and the mobile app.
- [Peer docs](${LINKS.peerDocs})
`;
}

export function llmsFullTxt(): string {
  return `# ${SITE.name}: agent guide

> ${SITE.description}

Reviewed ${SITE.reviewed}. Source of truth for flags: \`${CLI.bin} --help\` in the version you installed. HTML version: ${abs(LINKS.docs)}

## Rules to hold before you spend anything

${AGENT_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## Overview

PayHumans turns a payment an agent wants made into an order a person can fill. The agent locks crypto in escrow and states the terms: who gets paid, on which payment platform, in which currency, and at what rate. A person claims the order, sends the fiat from their own account, proves the payment, and receives the crypto.

Two things move, in two places. Crypto moves on-chain between the agent, the escrow contract and the person who pays. Fiat moves off-chain, from that person's payment account to the recipient. A proof of the fiat payment is the only thing that connects them.

Sequence:

1. Agent funds an order. Its crypto is converted to ${SETTLEMENT.asset} on ${SETTLEMENT.chain} and locked in Peer's escrow with the recipient, platform, currency and rate.
2. A person claims some or all of it in the Peer app. That amount is reserved for them for a limited time.
3. They send the fiat to the recipient from their own payment account.
4. They prove the payment. Peer checks it against the claim: recipient, amount, currency and timing.
5. The escrow releases the reserved USDC to that person, less Peer's fees. With no valid proof in time, the claim expires and its funds return to the order once the expired claim is cleared.

## Where funds sit

- The escrow is Peer's production escrow contract on ${SETTLEMENT.chain} (chain ID ${SETTLEMENT.chainId}). PayHumans deploys no contracts of its own.
- The escrow holds ${SETTLEMENT.asset} on ${SETTLEMENT.chain}: \`${SETTLEMENT.usdcAddress}\`.
- Funding from another chain or asset means a swap or bridge into ${SETTLEMENT.asset} on ${SETTLEMENT.chain}, carried out by a routing provider before the deposit. There is no escrow on Solana, Ethereum or Bitcoin.
- The order belongs to your Base account. With an EVM key, that is the key's own address. With a Solana key, the CLI derives a Base account from the key, so you still manage one secret. Keep that key: it is the only way to withdraw.
- PayHumans never holds funds or keys. The CLI signs locally. Between the route and the deposit, funds sit in your own Base account.

Path of funds: funding wallet (your key) -> routing provider (in transit) -> your Base account (your key) -> Peer escrow (contract).
Fees along it: source network fee, route fee (quoted up front), Base gas for the approval and the deposit.

## Install

Requires Node.js ${CLI.node} or newer.

${code(CLI_COMMANDS.install)}

## Quickstart

${code(CLI_QUICKSTART)}

Results are JSON on stdout. Errors are JSON on stderr with a non-zero exit code. Every command that spends is a preview until you pass \`--yes\`.

## Wallets and keys

The agent uses a wallet it already controls. There is no account to create, no API key, and no hosted wallet. Provide one signing key through your secret manager, for the chain you fund from.

${table(["Variable", "Purpose"], ENV_VARS.map((v) => [`\`${v.name}\``, v.purpose]))}

Never put a key in a command argument, a prompt, a log or a website. The browser login on payhumans.ai is optional, exists for people recovering a claim made in the browser, and is never needed by an agent.

## Balances

${code(CLI_COMMANDS.wallet)}

\`${CLI.bin} wallet\` (alias \`balances\`) prints the balance of the asset you fund from, and your Base account with its USDC and ETH.

- The funding wallet needs the asset itself plus that chain's network fee: a little SOL on Solana, a little ETH on an EVM chain.
- The Base account needs a little ETH for the approval and the deposit. When you fund from another chain the CLI buys a small amount through the route if the balance is low. When you fund from Base, or with bitcoin, it must already hold at least 0.00002 ETH.

## Platforms and recipients

An order names one payment platform, one fiat currency and one recipient. Ask the CLI what is supported rather than hard-coding it.

Three different sets, do not confuse them: ${PLATFORM_SETS.catalog} platforms are in the Peer catalog and can be named in an order. ${PLATFORM_SETS.inApp.length} of them can be filled in the Peer mobile app (${listOf(PLATFORM_SETS.inApp)}). ${PLATFORM_SETS.alerts.length} of those can be chosen in the app's order alerts (${listOf(PLATFORM_SETS.alerts)}).

${code(CLI_COMMANDS.discover)}

Recipient rules as of ${SITE.reviewed} (\`${CLI.bin} platforms\` is the authority):

${table(
  ["Platform", "--platform", "Recipient is a", "Before the first order", "Currencies", "Fillable in Peer app", "App alerts"],
  PLATFORMS.map((p) => [p.name, `\`${p.id}\``, p.recipient, p.setup, p.currencies.join(" "), APP_SUPPORT[p.inPeerApp], p.alerts ? "Yes" : "No"]),
)}

"Fillable in Peer app" says whether people can fill orders on that platform in the Peer mobile app. "Newer versions" (${listOf(PLATFORM_SETS.inAppNewer)}) means support is in the app's current source but has not been confirmed in the store build. An order on a platform marked "No" (${listOf(PLATFORM_SETS.notInApp)}) can be created, but cannot be filled through the current Peer mobile app; other Peer surfaces may differ. None of this has been observed on a production device.

Validate and register a recipient before funding anything. Registering stores the recipient's payment details with Peer so the app can show them to whoever claims; it moves no crypto. \`deposit create --yes\` registers for you if you skip it.

${code(CLI_COMMANDS.recipient)}

Validation checks the format, and on some platforms that the profile exists. It never proves the handle belongs to the person you mean to pay.

Wise, PayPal and Alipay: a recipient Peer has not seen before must prove they own the account, once, in a desktop browser with the Peer extension. Wise: ${LINKS.peerRegisterWise} . PayPal: ${LINKS.peerRegisterPaypal} . Alipay and the general entry point: ${LINKS.peerRegisterRecipient} (guide: ${LINKS.peerSellerGuide}). An agent cannot do this for them. Until it is done the CLI stops with \`RECIPIENT_REGISTRATION_REQUIRED\` before any funds move. A recipient who is already verified can be reused. PayPal recipients must be personal accounts.

## Funding routes

Choose the source with \`--source-chain\` and \`--source-asset\`. The default is USDC on Solana. The CLI converts to ${SETTLEMENT.asset} on ${SETTLEMENT.chain} through a routing provider (Relay) and refuses a source it cannot route before anything is sent. USDC already sitting in your Base account is used first; only the shortfall is routed.

${routesTable()}

Status meanings:

${(Object.keys(ROUTE_STATUS) as (keyof typeof ROUTE_STATUS)[]).map((s) => `- ${ROUTE_STATUS[s].label}: ${ROUTE_STATUS[s].meaning}`).join("\n")}

- A listed route still needs a live quote. Availability, minimum size and fees are decided when you preview.
- Native bitcoin works differently. The CLI holds no Bitcoin key. It returns a deposit address, an exact amount and a deadline from the provider (NEAR Intents); you send BTC once from your own wallet, then resume the operation. It needs \`--refund-address\`, an EVM key to own the order, and ETH on Base for gas. The provider's minimum varies: a quote for a 5 USDC order was rejected and one for 10 USDC succeeded. Your Bitcoin network fee is extra, and a failed route may refund less than you sent. Never send after the deadline or a second time. Native BTC funded 10 USDC in mainnet deposit 6022 on October 4; the unused funds were recovered on Base. Fiat payment remains unverified.
- Wrapped bitcoin (WBTC, cbBTC and similar) is a different asset and is not accepted.

## Preview and cost

Run \`deposit create\` without \`--yes\`. With a key configured, the CLI checks the recipient's format, fetches a live route quote and prints the plan. With no key it prints the terms only. Either way nothing is registered, signed or sent.

${code(CLI_COMMANDS.preview)}

${code(CLI_COMMANDS.previewOtherSource)}

What an order costs you:

- The rate. \`--amount\` is the gross USDC in escrow and \`--rate\` is fiat sent per USDC of escrow claimed. At 0.98, a claim of 5 USDC asks for 4.90 in fiat, rounded up to a cent. Peer's fees are then taken from that USDC, so the person receives a little less than 5. Preview field: \`fiatForFullDeposit\`.
- Route fee. The routing provider's charge to convert your asset to USDC on Base. Zero when you fund with USDC on Base. Preview field: \`routes.funding\`.
- Network fees. Gas on the source chain, and on Base for the approval and deposit. Preview fields: \`routes.gas\`, \`caps\`.

\`totalSourceInput\` is what the route takes from your funding wallet, in the source asset, with the route's fees included. Network gas you pay directly is on top of it. Peer's own fees come out of the USDC the person receives, not out of your wallet.

Limits you set. The CLI stops before signing if a quote exceeds one:

${SPEND_CAPS.map((c) => `- \`${c.flag}\`: ${c.bounds}`).join("\n")}

Costs none of these limits cover:

${UNCAPPED_COSTS.map((c) => `- ${c}`).join("\n")}

Leave a small margin for those. Each limit covers one order; keep your own budget across orders.

## Create an order

Repeat the command you previewed and add an operation ID you choose, a source spend limit, and \`--yes\`.

${code(CLI_COMMANDS.create)}

In order, the CLI then:

1. Validates and registers the recipient, and prepares the deposit. No funds have moved yet.
2. Runs the route: your asset becomes USDC in your Base account.
3. Approves the escrow for exactly the order amount.
4. Creates the deposit and reads its ID from the transaction receipt.
5. Turns off Peer's dispute protection for the order's platform. That removes the stake a person would otherwise have to post to claim, and nothing else: Peer's other eligibility rules still apply. You accept the risk of a payment being reversed after release. Pass \`--require-stake\` to keep it on.

The result includes \`depositId\`, \`compositeDepositId\`, \`transactionHash\`, each route's \`requestId\` and status, and a \`claimUrl\`. It also repeats: the deposit is created; fiat has not been paid or proven by this action.

Orders several people can fill: \`--min\` and \`--max\` set the smallest and largest single claim, in gross USDC. By default a claim can be anything from 1 USDC up to the whole order. Each claim is a separate fiat payment, so the recipient may receive several smaller payments instead of one.

${code(CLI_COMMANDS.partial)}

All flags on \`deposit create\`:

${table(["Flag", "Needed", "Meaning"], CREATE_FLAGS.map((f) => [`\`${f.flag}\``, f.required, f.meaning.replace(/`/g, "")]))}

## Identifiers

${table(["ID", "Comes from", "Use it to"], IDENTIFIERS.map((i) => [`\`${i.name}\``, i.from.replace(/`/g, ""), i.use]))}

## Status and partial fills

${code(CLI_COMMANDS.status)}

\`deposit show\` needs no key. It reports where the order's USDC is and lists every claim under \`intents\`. Top-level balances are decimal USDC; nested intent amount fields use USDC base units (6 decimals, so 1000000 means 1 USDC). The response labels these fields in \`intentAmountUnits\`. \`disputeProtection\` reports current per-platform policy and stake requirements, or null when the setting is unknown or the deposit is closed. Do not interpret null as disabled.

${table(["Field", "Meaning"], BALANCES.map((b) => [`\`${b.key}\``, b.meaning]))}

funded = available + reserved + fulfilled + withdrawn.

- A claim is not a payment. A claim in the \`SIGNALED\` state is a reservation. Only \`FULFILLED\` means the escrow released USDC against a verified fiat payment.
- Fiat delivered so far is about \`fulfilled\` multiplied by your rate; each claim's fiat amount is rounded up to a cent. For proof of an individual payment, read that claim's receipt fields under \`intents\`.
- \`available\` and \`reserved\` are read from the chain. \`funded\`, \`fulfilled\`, \`withdrawn\` and \`intents\` come from Peer's indexer and can trail by a short time. If \`indexed\` is false, the indexed fields are null rather than zero and only the chain values are present.
- \`deposit list --owner <address>\` includes closed orders from the indexer for the current Base escrow. It is a historical view and may lag onchain liquidity.
- On RPC throttling, back off 15–30 seconds. A private Base endpoint can be set with \`PAYHUMANS_ESCROW_RPC_URL\` or \`PAYHUMANS_RPC_8453\`; keep credentials in your secret environment. Resume the original operation ID after interrupted execution.
- Polling once a minute is plenty. An order is finished when \`available\` and \`reserved\` are both zero.

## Expiry and cancellation

- A claim reserves USDC for a limited window set by Peer. Its expiry time is on the claim.
- The person can cancel a claim they have not paid. The reserved USDC becomes available again.
- If the window passes without a valid proof, the claim is no longer valid. Its USDC may still show as reserved until Peer clears the expired claim; after that it can be claimed again or withdrawn. Check the claim's status before acting.
- The agent cannot cancel someone else's active claim, and should not try to work around one: that person may already have sent the fiat.
- An order itself does not expire. It stays open until it is filled or you withdraw.
- If fiat was sent but the proof fails or is late, the escrow does not pay and the fiat cannot be recovered through PayHumans or Peer.

## Recovery and withdrawal

An interrupted run: the CLI keeps a local journal in \`${JOURNAL.path}\` (override with \`PAYHUMANS_STATE_DIR\`).

${JOURNAL.facts.map((x) => `- ${x}`).join("\n")}

If a run crashes or a route is slow, resume it:

${code(CLI_COMMANDS.operations)}

Take back unclaimed funds: \`deposit withdraw\` removes available USDC from the order (all of it unless you pass \`--amount\`) and sends it to your Base account. It never touches reserved USDC and never cancels a claim. The command signs with the wallet selected by \`--source-chain\` and \`--source-asset\` (default: the Solana key), so pass the same source you funded with.

${code(CLI_COMMANDS.withdraw)}

Send it home: after a withdrawal the USDC is in your Base account. With an EVM key, that is already your wallet. With a Solana key, \`return\` routes it back to the same Solana wallet as USDC; \`--min-receive\` is required and bounds fees and slippage. There is no route back to bitcoin.

${code(CLI_COMMANDS.returnFunds)}

Remove the stake requirement: if dispute protection is still on for an order, people must post stake to claim it. \`deposit open-claims\` turns it off for one platform on one order. It removes that stake requirement only; Peer's other eligibility rules still apply.

${code(CLI_COMMANDS.openClaims)}

## Errors

A failed command exits non-zero and writes one JSON object to stderr: \`{"error": {"code": "...", "message": "...", "next": "..."}}\`. Stdout carries only successful results.

${ERROR_CODES.map((e) => `- \`${e.code}\`: ${e.meaning.replace(/`/g, "")}`).join("\n")}

## How people fill orders

An order is an ordinary Peer deposit, so people fill it in the Peer mobile app, from its P2P tab or Buy USDC flow. From their side they are buying USDC at your rate by paying your recipient. There is no PayHumans account. This workflow is taken from the app's current source; it has not been observed on a production device.

1. They choose a currency and a payment platform they already use.
2. The app lists open orders by price. They pick one and claim some or all of it.
3. They send the exact fiat amount to the recipient shown, from their own account.
4. They verify the payment inside the app. The escrow releases the USDC to them, less Peer's fees.

Nobody is guaranteed to see your order. ${DISCOVERY.visibility} ${DISCOVERY.alerts} A small order can sit unclaimed.

In the app, UPI payments are proved through Amazon Pay (person-to-person UPI from a linked bank account; not UPI Lite or merchant payments), and Zelle payments from Bank of America or Citi.

- Guide for people, with download links: ${abs(LINKS.earn)}
- Get the Peer app: ${LINKS.peerOnboard} (App Store: ${LINKS.appStore} ; Google Play: ${LINKS.playStore})
- The CLI's \`claimUrl\` (\`${SITE.url}/earn?deposit=<id>\`) opens the claim page, which shows that order's live terms read from the escrow. Share it so a person can check the recipient, amount and rate.

## Verification limits

Payment verification is done by Peer's verification service and escrow contract, not by PayHumans.

- Only supported platforms and currencies can be proved, and support differs between them.
- The proof must match the claim: recipient, amount, currency, and a payment made after the claim.
- A proof shows a payment left the person's account. It does not cover later reversals, disputes or holds by the payment platform.
- Changes on a payment platform can temporarily break verification for it.

## Project status as of ${VERIFICATION.asOf}

Run on mainnet with real funds:

${VERIFICATION.verified.map((v) => `- ${v}`).join("\n")}

Not yet verified:

${VERIFICATION.unverified.map((v) => `- ${v}`).join("\n")}

PayHumans.ai is an independent project. It began as a website prototype on March 27, 2026. The CLI, the live escrow integration and the current site were built from October 2, 2026 onward. The escrow contracts, payment verification, SDKs and mobile app are Peer's existing infrastructure, not new work by PayHumans. Routing is provided by Relay, and by NEAR Intents for the external-wallet native bitcoin route.
`;
}

export function agentGuide() {
  return {
    name: SITE.name,
    url: SITE.url,
    reviewed: SITE.reviewed,
    summary: SITE.description,
    rules: AGENT_RULES.map((r) => r.replace(/`/g, "")),
    cli: {
      package: CLI.packageName,
      executable: CLI.bin,
      node: `>=${CLI.node}`,
      install: CLI.install,
      output: "JSON on stdout. Errors are JSON on stderr with a non-zero exit code.",
      previewByDefault: true,
      executeFlag: "--yes",
      requiredWithExecute: {
        "deposit create": ["--operation-id", "--max-source-spend"],
        "deposit withdraw": ["--operation-id"],
        "deposit open-claims": ["--operation-id"],
        return: ["--operation-id", "--min-receive"],
        "recipient register": [],
        "operations resume": ["saved operation ID; original limits are reused"],
      },
      commands: [
        { command: "platforms", purpose: "List payment platforms, currencies and recipient rules.", needsKey: false },
        { command: "routes [--live]", purpose: "List crypto sources the CLI can fund from.", needsKey: false },
        { command: "wallet [--source-chain] [--source-asset]", purpose: "Show the funding balance and the Base account. Alias: balances.", needsKey: true },
        { command: "recipient validate --platform --recipient", purpose: "Check a recipient identifier.", needsKey: false },
        { command: "recipient register --platform --recipient [--yes]", purpose: "Register recipient details with Peer. Moves no crypto.", needsKey: false },
        { command: "recipient show --platform --hash <bytes32>", purpose: "Read back a registered recipient by its hash.", needsKey: false },
        { command: "deposit create ...", purpose: "Preview an order; with --yes, fund and create it.", needsKey: "For live balances/quotes and execution; keyless preview shows terms only." },
        { command: "deposit show <deposit-id>", purpose: "Read balances and claims for an order.", needsKey: false },
        { command: "deposit list [--owner <address>] [--source-chain] [--source-asset]", purpose: "List orders owned by an account. Without --owner the source wallet supplies the Base owner.", needsKey: "Only when --owner is omitted. Source defaults to Solana USDC; EVM wallets must select their source explicitly." },
        { command: "deposit withdraw --id <deposit-id> [--amount]", purpose: "Take available USDC back to your Base account. Never cancels a claim.", needsKey: "Only with --yes; select the owning source wallet." },
        { command: "deposit open-claims --id <deposit-id> --platform <name>", purpose: "Remove the dispute-protection stake requirement for one platform on an order. Other eligibility rules still apply.", needsKey: "Only with --yes." },
        { command: "return [--amount] --min-receive <usdc>", purpose: "Route USDC from your Base account back to the same Solana wallet.", needsKey: true },
        { command: "operations list | show <id> | resume <id>", purpose: "Inspect and resume journaled runs.", needsKey: "Only for resume --yes; use the same original source key." },
      ],
      createFlags: CREATE_FLAGS.map((f) => ({ ...f, meaning: f.meaning.replace(/`/g, "") })),
      examples: CLI_COMMANDS,
      environment: ENV_VARS,
      errorCodes: ERROR_CODES.map((e) => ({ ...e, meaning: e.meaning.replace(/`/g, "") })),
      spendCaps: SPEND_CAPS,
      costsOutsideCaps: UNCAPPED_COSTS,
      operationJournal: { path: JOURNAL.path, override: "PAYHUMANS_STATE_DIR", facts: JOURNAL.facts },
    },
    settlement: {
      ...SETTLEMENT,
      note: "Every order is USDC in Peer's escrow contract on Base, whatever funded it. There is no escrow on Solana, Ethereum or Bitcoin.",
    },
    fundingRoutes: FUNDING_ROUTES.map((r) => ({ ...r, statusLabel: ROUTE_STATUS[r.status].label })),
    routeStatusMeanings: ROUTE_STATUS,
    platforms: PLATFORMS.map((p) => ({
      platform: p.id,
      name: p.name,
      recipientFormat: p.recipient,
      beforeFirstOrder: p.setup,
      recipientMustVerifyOnce: p.registration === "peer-extension",
      registrationUrl: registrationUrl(p.id),
      fillableInPeerApp: p.inPeerApp,
      fillableInPeerAppLabel: APP_SUPPORT[p.inPeerApp],
      appAlerts: p.alerts,
      currencies: p.currencies,
    })),
    platformSets: {
      catalog: PLATFORM_SETS.catalog,
      fillableInPeerApp: PLATFORM_SETS.inApp,
      fillableOnlyInNewerAppVersions: PLATFORM_SETS.inAppNewer,
      notFillableInPeerApp: PLATFORM_SETS.notInApp,
      appAlerts: PLATFORM_SETS.alerts,
      note: "App support is taken from the Peer app's current source. Store rollout and behaviour on a production device are unverified.",
    },
    rate: "--amount is gross USDC in escrow. --rate is fiat sent per USDC of escrow claimed. Peer's fees are taken from the USDC the person receives, so they receive less than they claim.",
    identifiers: IDENTIFIERS.map((i) => ({ ...i, from: i.from.replace(/`/g, "") })),
    orderBalances: BALANCES,
    claimStates: {
      SIGNALED: "A person has claimed. USDC is reserved. No payment is proven.",
      FULFILLED: "A fiat payment was verified and the escrow released USDC to the person, less Peer's fees.",
    },
    humans: {
      workflow: "Peer mobile app: P2P tab or Buy USDC flow.",
      guide: abs(LINKS.earn),
      claimPage: abs(LINKS.recover),
      app: { onboarding: LINKS.peerOnboard, appStore: LINKS.appStore, googlePlay: LINKS.playStore },
      discovery: `Not guaranteed. ${DISCOVERY.visibility}`,
      alerts: DISCOVERY.alerts,
      upi: "Proved in the app through Amazon Pay: person-to-person UPI from a linked bank account. UPI Lite and merchant payments are not supported.",
      zelle: "The app verifies Zelle payments sent from Bank of America or Citi.",
    },
    verification: VERIFICATION,
    docs: {
      html: abs(LINKS.docs),
      llms: abs(LINKS.llms),
      llmsFull: abs(LINKS.llmsFull),
      npm: LINKS.npm,
    },
    attribution: "Independent project. Escrow, payment verification, SDKs and the mobile app are Peer's. Routing by Relay; NEAR Intents for external-wallet native bitcoin.",
  };
}
