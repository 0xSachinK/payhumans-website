/*
  Single source of product facts for the site, /llms.txt, /llms-full.txt and
  /agent-guide.json. Pages and agent docs render from here, so a release only
  needs this file reconciled: FUNDING_ROUTES, PLATFORMS, CLI_COMMANDS and VERIFICATION.
*/

export const SITE = {
  name: "PayHumans.ai",
  url: "https://payhumans.ai",
  tagline: "Agents fund it. Humans pay it.",
  description:
    "PayHumans lets an AI agent get a real-world fiat payment made. The agent funds an order with supported crypto and names a recipient; a person sends the money from their own payment app and collects the crypto once the payment is verified. Built on Peer.",
  reviewed: "2026-10-04",
} as const;

export const LINKS = {
  docs: "/docs",
  cliDocs: "/docs#quickstart",
  earn: "/earn",
  app: "/earn",
  recover: "/earn/recover",
  llms: "/llms.txt",
  llmsFull: "/llms-full.txt",
  agentGuide: "/agent-guide.json",
  npm: "https://www.npmjs.com/package/payhumans-ai-cli",
  peer: "https://peer.xyz",
  peerDocs: "https://docs.peer.xyz",
  // Official Peer onboarding page; it detects the device and opens the right store.
  peerOnboard: "https://mobile.peer.xyz/onboard",
  appStore: "https://apps.apple.com/us/app/peer-pay-earn/id6749191100",
  playStore: "https://play.google.com/store/apps/details?id=com.zkp2p.mobile.dev",
  peerRegisterRecipient: "https://app.peer.xyz/sell?tab=advanced",
  peerRegisterWise: "https://app.peer.xyz/sell/wise",
  peerRegisterPaypal: "https://app.peer.xyz/sell/paypal",
  peerSellerGuide: "https://docs.peer.xyz/guides/for-sellers/provide-liquidity-sell-usdc",
  peerBuyerGuide: "https://docs.peer.xyz/guides/for-buyers/complete-guide-to-onboarding",
  peerExtension:
    "https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih",
  buildLab: "https://luma.com/superteam-5ffe",
} as const;

export const CLI = {
  packageName: "payhumans-ai-cli",
  bin: "payhumans",
  node: "22",
  install: "npm install -g payhumans-ai-cli",
} as const;

/* Where every order settles, whatever funded it. */
export const SETTLEMENT = {
  asset: "USDC",
  chain: "Base",
  chainId: 8453,
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  protocol: "Peer",
} as const;

/*
  Funding routes. Keep this conservative: "tested" means PayHumans funded a
  mainnet deposit through the route; "listed" means the CLI implements it but
  PayHumans has not funded a deposit through it. A dry quote is not a test.
*/
export type RouteStatus = "tested" | "listed" | "unavailable";

export const ROUTE_STATUS: Record<RouteStatus, { label: string; meaning: string }> = {
  tested: {
    label: "Tested on mainnet",
    meaning: "PayHumans funded, created and withdrew a real deposit through this route.",
  },
  listed: {
    label: "Listed, not tested",
    meaning:
      "Implemented in the CLI. PayHumans has not yet funded a deposit through it. A preview that succeeds is a quote, not a funded test.",
  },
  unavailable: {
    label: "Not available",
    meaning: "The CLI rejects this source. Nothing is sent.",
  },
};

export const FUNDING_ROUTES: {
  asset: string;
  chain: string;
  status: RouteStatus;
  note: string;
}[] = [
  {
    asset: "USDC",
    chain: "Solana",
    status: "tested",
    note: "Mainnet deposits 5962, 5968 and 5970 on October 2, 2026: funded, created, withdrawn and returned to the Solana wallet.",
  },
  {
    asset: "USDC",
    chain: "Base",
    status: "listed",
    note: "Already the settlement asset, so there is no conversion and no route fee. The wallet must already hold ETH on Base for gas.",
  },
  {
    asset: "USDC",
    chain: "Ethereum, Arbitrum, Optimism, Polygon",
    status: "listed",
    note: "Bridged to USDC on Base by the routing provider.",
  },
  {
    asset: "ETH",
    chain: "Ethereum, Base",
    status: "tested",
    note: "Independent installed-CLI tests funded 5 USDC each: Ethereum deposit 6020 and Base deposit 6021 on October 4. This verifies funding, not fiat payment.",
  },
  {
    asset: "ETH",
    chain: "Arbitrum, Optimism",
    status: "listed",
    note: "Swapped to USDC on Base by the routing provider.",
  },
  {
    asset: "SOL",
    chain: "Solana",
    status: "tested",
    note: "Native SOL funded 5 USDC in mainnet deposit 6019 on October 4. The unused escrow was withdrawn to its Base owner.",
  },
  {
    asset: "BTC (native)",
    chain: "Bitcoin",
    status: "tested",
    note: "An external native Bitcoin wallet funded 10 USDC in deposit 6022 through NEAR Intents on October 4; the unused escrow was withdrawn on Base. You send BTC yourself once. Provider minimums vary and Bitcoin network fees are extra. The CLI never holds a Bitcoin key; wrapped bitcoin is not accepted.",
  },
];

/*
  Payment platforms: the 12 in the Peer catalog that `payhumans platforms`
  returns. Recipient formats and registration rules come from Peer's current
  processors; currency lists are a snapshot of the catalog on the review date.
  `payhumans platforms` is the authority at run time.

  Three different sets, kept separate on purpose:
  - all 12 can be named in an order;
  - 10 can be filled in the Peer mobile app (8 "yes" + 2 "newer");
  - 8 can be chosen in the app's order alerts (`alerts: true`).
*/
export const APP_SUPPORT = {
  yes: "Yes",
  newer: "Newer versions",
  no: "No",
} as const;

export const PLATFORMS: {
  id: string;
  name: string;
  recipient: string;
  setup: string;
  registration: "none" | "peer-extension";
  // "yes": fillable in the Peer app. "newer": in the app's current source, store rollout unconfirmed. "no": not in the app.
  inPeerApp: "yes" | "newer" | "no";
  // Whether the app's opt-in order alerts can be set for this platform.
  alerts: boolean;
  currencies: string[];
}[] = [
  {
    id: "venmo",
    name: "Venmo",
    recipient: "Venmo username",
    setup: "Checked against the live Venmo profile when the order is created.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD"],
  },
  {
    id: "revolut",
    name: "Revolut",
    recipient: "Revtag",
    setup: "Checked against the public Revolut profile when the order is created.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD", "EUR", "GBP", "SGD", "NZD", "AUD", "CAD", "JPY", "HKD", "MXN", "SAR", "AED", "THB", "TRY", "PLN", "CHF", "ZAR", "CNY", "CZK", "DKK", "HUF", "NOK", "RON", "SEK"],
  },
  {
    id: "cashapp",
    name: "Cash App",
    recipient: "Cashtag, without the leading $",
    setup: "The Cash App profile must be public and resolve.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD"],
  },
  {
    id: "wise",
    name: "Wise",
    recipient: "Wisetag, without the leading @",
    setup: "A recipient Peer has not seen before must verify the account once. The recipient does this themselves; an agent cannot. An already verified recipient can be reused.",
    registration: "peer-extension",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD", "CNY", "EUR", "GBP", "AUD", "NZD", "CAD", "AED", "CHF", "ZAR", "SGD", "ILS", "HKD", "JPY", "PLN", "TRY", "IDR", "KES", "MYR", "MXN", "THB", "VND", "UGX", "CZK", "DKK", "HUF", "INR", "NOK", "PHP", "RON", "SEK"],
  },
  {
    id: "paypal",
    name: "PayPal",
    recipient: "PayPal.me username, not an email",
    setup: "Same one-time verification as Wise. The recipient must be a personal PayPal account.",
    registration: "peer-extension",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD", "EUR", "GBP", "SGD", "NZD", "AUD", "CAD"],
  },
  {
    id: "zelle",
    name: "Zelle",
    recipient: "Enrolled email address, lowercase",
    setup: "Format check only. Nothing confirms the email is enrolled with Zelle, so confirm it with the recipient.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD"],
  },
  {
    id: "chime",
    name: "Chime",
    recipient: "$ChimeSign, lowercase, with the leading $",
    setup: "Format check only. Confirm the ChimeSign with the recipient.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["USD"],
  },
  {
    id: "monzo",
    name: "Monzo",
    recipient: "Monzo.me username",
    setup: "Checked against the Monzo profile when the order is created.",
    registration: "none",
    inPeerApp: "yes",
    alerts: true,
    currencies: ["GBP"],
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    recipient: "22-digit CVU",
    setup: "Checksum validation only.",
    registration: "none",
    inPeerApp: "no",
    alerts: false,
    currencies: ["ARS"],
  },
  {
    id: "upi",
    name: "UPI",
    recipient: "VPA such as name@bank, lowercase",
    setup: "Format check only. In the Peer app the payer proves the payment through Amazon Pay: person-to-person UPI from a linked bank account. UPI Lite and merchant payments are not supported.",
    registration: "none",
    inPeerApp: "newer",
    alerts: false,
    currencies: ["INR"],
  },
  {
    id: "alipay",
    name: "Alipay",
    recipient: "Alipay account email",
    setup: "Same one-time verification as Wise.",
    registration: "peer-extension",
    inPeerApp: "newer",
    alerts: false,
    currencies: ["CNY"],
  },
  {
    id: "xmoney",
    name: "X Money",
    recipient: "X username, without the leading @",
    setup: "Format check only. Nothing confirms the account exists or has X Money enabled, so confirm it with the recipient.",
    registration: "none",
    inPeerApp: "no",
    alerts: false,
    currencies: ["USD"],
  },
];

/* Counts and names derived from the table, so copy cannot drift from it. */
const names = (list: typeof PLATFORMS) => list.map((p) => p.name);
export const PLATFORM_SETS = {
  catalog: PLATFORMS.length,
  inApp: names(PLATFORMS.filter((p) => p.inPeerApp !== "no")),
  inAppConfirmed: names(PLATFORMS.filter((p) => p.inPeerApp === "yes")),
  inAppNewer: names(PLATFORMS.filter((p) => p.inPeerApp === "newer")),
  notInApp: names(PLATFORMS.filter((p) => p.inPeerApp === "no")),
  alerts: names(PLATFORMS.filter((p) => p.alerts)),
} as const;

/* "A, B and C" */
export const listOf = (items: readonly string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/*
  CLI reference. Only commands and flags that exist in packages/cli are listed.
  Reconcile with `payhumans --help` before each release.
*/
export const CLI_COMMANDS = {
  install: `npm install -g ${CLI.packageName}
${CLI.bin} --version`,

  discover: `${CLI.bin} platforms        # payment platforms, currencies, recipient rules
${CLI.bin} routes           # crypto sources the CLI can fund from
${CLI.bin} routes --live    # plus what the routing providers advertise right now`,

  wallet: `${CLI.bin} wallet                                             # USDC on Solana (default)
${CLI.bin} wallet --source-chain solana --source-asset SOL
${CLI.bin} wallet --source-chain ethereum --source-asset ETH`,

  recipient: `${CLI.bin} recipient validate --platform revolut --recipient '<revtag>'
${CLI.bin} recipient register --platform revolut --recipient '<revtag>'         # preview
${CLI.bin} recipient register --platform revolut --recipient '<revtag>' --yes
${CLI.bin} recipient show --platform revolut --hash '<registered-payee-hash>'`,

  preview: `# Preview: prints the plan as JSON. Nothing is signed or sent.
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 5 --currency USD --rate 0.98`,

  previewOtherSource: `# The same order, funded from ETH on Ethereum instead
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 5 --currency USD --rate 0.98 \\
  --source-chain ethereum --source-asset ETH`,

  create: `# Same command, plus an operation ID, a source spend cap and --yes.
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 5 --currency USD --rate 0.98 \\
  --operation-id invoice-1042 --max-source-spend 5.5 --yes`,

  partial: `# One order that several people can fill, 1 to 5 USDC at a time
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 20 --currency USD --rate 0.98 --min 1 --max 5`,

  status: `${CLI.bin} deposit show <deposit-id>
${CLI.bin} deposit list --owner '<Base-deposit-owner-address>'
# Or derive the owner from your configured source wallet:
${CLI.bin} deposit list --source-chain ethereum --source-asset ETH`,

  operations: `${CLI.bin} operations list
${CLI.bin} operations show invoice-1042
${CLI.bin} operations resume invoice-1042          # preview
${CLI.bin} operations resume invoice-1042 --yes`,

  withdraw: `${CLI.bin} deposit withdraw --id <deposit-id>              # preview
${CLI.bin} deposit withdraw --id <deposit-id> \\
  --operation-id invoice-1042-withdraw --yes

# Funded from an EVM wallet? Name it, so the CLI signs with that key.
${CLI.bin} deposit withdraw --id <deposit-id> \\
  --source-chain ethereum --source-asset ETH \\
  --operation-id invoice-1042-withdraw --yes`,

  returnFunds: `${CLI.bin} return --amount 5                             # preview, shows minimum received
${CLI.bin} return --amount 5 --min-receive 4.8 \\
  --operation-id invoice-1042-return --yes`,

  openClaims: `${CLI.bin} deposit open-claims --id <deposit-id> --platform revolut \\
  --operation-id invoice-1042-open --yes`,
} as const;

export const CLI_QUICKSTART = `${CLI.install}

# 1. What can be paid, and what can fund it
${CLI.bin} platforms
${CLI.bin} routes

# 2. Preview an order. Nothing is signed or sent.
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 5 --currency USD --rate 0.98

# 3. Same command with an ID, a source spend cap and --yes
${CLI.bin} deposit create --platform revolut --recipient '<revtag>' \\
  --amount 5 --currency USD --rate 0.98 \\
  --operation-id invoice-1042 --max-source-spend 5.5 --yes

# 4. Watch it, then take back whatever was not claimed
${CLI.bin} deposit show <deposit-id>
${CLI.bin} deposit withdraw --id <deposit-id> \\
  --operation-id invoice-1042-withdraw --yes`;

/* Flags on `deposit create`. */
export const CREATE_FLAGS: { flag: string; required: string; meaning: string }[] = [
  { flag: "--platform <name>", required: "Always", meaning: "Payment platform, from `payhumans platforms`." },
  { flag: "--recipient <id>", required: "Always", meaning: "Who gets the fiat, in that platform's identifier format." },
  { flag: "--amount <usdc>", required: "Always", meaning: "USDC to put in escrow. This is the gross amount, before Peer's fees." },
  { flag: "--currency <code>", required: "Always", meaning: "Fiat currency the recipient is paid in." },
  { flag: "--rate <fiat-per-usdc>", required: "Always", meaning: "Fiat a person sends per USDC of escrow they claim. 0.98 means $4.90 for a 5 USDC claim. Peer's fees then come out of that USDC, so the person receives a little less than they claimed." },
  { flag: "--source-chain <chain>", required: "Default solana", meaning: "Where the funding crypto is: ethereum, base, arbitrum, optimism, polygon, solana or bitcoin." },
  { flag: "--source-asset <asset>", required: "Default USDC", meaning: "ETH, SOL, USDC or BTC, depending on the chain." },
  { flag: "--min <usdc>, --max <usdc>", required: "Optional", meaning: "Smallest and largest single claim. Defaults: 1 USDC (or the full amount if smaller) and the full amount." },
  { flag: "--operation-id <id>", required: "With --yes", meaning: "Your own unique ID for this payment. Reuse it on every retry: the CLI then resumes the saved operation from its local journal instead of starting a new payment." },
  { flag: "--max-source-spend <amount>", required: "With --yes", meaning: "Most of the source asset the route may take, including fees priced into the route and any Base gas it buys. Network gas you pay directly is not included. For USDC sources, --max-spend is accepted as an alias and also caps the deposit." },
  { flag: "--max-route-fee-usd <usd>", required: "Default 2", meaning: "Most the routing provider may charge in service and relay fees, in USD. Source network gas is separate." },
  { flag: "--slippage-bps <bps>", required: "Default 50", meaning: "Swap slippage tolerance, 0 to 100 basis points." },
  { flag: "--max-source-gas <native>", required: "Default 0.002 SOL or 0.001 ETH", meaning: "Ceiling on source-chain execution gas. Solana account rent and your own Bitcoin transaction fee are not covered by it." },
  { flag: "--max-base-gas <eth>", required: "Default 0.0001", meaning: "Ceiling on Base execution gas for the approval and deposit. The L1 data fee Base adds can be extra." },
  { flag: "--require-stake", required: "Optional", meaning: "Keep Peer's dispute protection on, so people must post stake to claim." },
  { flag: "--refund-address <btc-address>", required: "Bitcoin only", meaning: "Your own mainnet Bitcoin address, used if the provider has to refund. A refund can be less than you sent." },
  { flag: "--yes", required: "To execute", meaning: "Sign and send. Without it every command is a preview." },
];

export const ENV_VARS: { name: string; purpose: string }[] = [
  {
    name: "PAYHUMANS_SOLANA_KEY",
    purpose: "Solana signing key for a Solana funding wallet: a base58 secret or a Solana CLI JSON array.",
  },
  {
    name: "PAYHUMANS_SOLANA_KEY_FILE",
    purpose: "Path to a file holding that key, instead of the variable above.",
  },
  {
    name: "PAYHUMANS_EVM_KEY",
    purpose: "0x-prefixed private key for an EVM funding wallet (Ethereum, Base, Arbitrum, Optimism, Polygon). Also owns the order when funding with bitcoin. PAYHUMANS_PRIVATE_KEY is accepted as an alias.",
  },
  {
    name: "PAYHUMANS_EVM_KEY_FILE",
    purpose: "Path to a file holding that key. PAYHUMANS_PRIVATE_KEY_FILE is accepted as an alias.",
  },
  {
    name: "PAYHUMANS_STATE_DIR",
    purpose: "Optional. Where operation journals are kept. Defaults to ~/.payhumans/operations. Keep and back up this directory: it is what protects a retry from paying twice.",
  },
  {
    name: "PAYHUMANS_SOLANA_RPC_URL",
    purpose: "Optional. Your own Solana RPC endpoint.",
  },
  {
    name: "PAYHUMANS_ESCROW_RPC_URL",
    purpose: "Optional. Your own Base RPC endpoint.",
  },
  {
    name: "PAYHUMANS_RPC_<chainId>",
    purpose: "Optional. Your own RPC endpoint for one EVM chain, for example PAYHUMANS_RPC_1 for Ethereum.",
  },
  {
    name: "PAYHUMANS_EVM_RPC_URL",
    purpose: "Optional. Your own RPC endpoint for whichever EVM source chain you selected.",
  },
  {
    name: "PAYHUMANS_RELAY_API_KEY",
    purpose: "Optional. Your own Relay API key.",
  },
  {
    name: "PAYHUMANS_NEAR_INTENTS_TOKEN",
    purpose: "Optional. Your own NEAR Intents token, used only by the bitcoin route.",
  },
];

/* Where a new recipient on a verify-first platform completes Peer's one-time check. */
export const registrationUrl = (platformId: string): string | null => {
  const p = PLATFORMS.find((x) => x.id === platformId);
  if (!p || p.registration !== "peer-extension") return null;
  if (platformId === "wise") return LINKS.peerRegisterWise;
  if (platformId === "paypal") return LINKS.peerRegisterPaypal;
  return LINKS.peerRegisterRecipient;
};

/* What each limit on `deposit create` bounds. */
export const SPEND_CAPS: { flag: string; bounds: string }[] = [
  {
    flag: "--max-source-spend",
    bounds:
      "What the route may take from your funding asset, in that asset's units: the amount converted, fees priced into the route, and any Base gas the route buys. Required with --yes. For USDC sources, --max-spend is accepted as an alias and also caps the deposit itself.",
  },
  {
    flag: "--max-route-fee-usd",
    bounds: "The routing provider's service and relay fees, in USD. Default 2.",
  },
  {
    flag: "--slippage-bps",
    bounds: "Swap slippage tolerance. Default 50, range 0 to 100.",
  },
  {
    flag: "--max-source-gas",
    bounds: "Execution gas on the source chain. Default 0.002 SOL or 0.001 ETH. A ceiling, not an amount held in reserve.",
  },
  {
    flag: "--max-base-gas",
    bounds: "Execution gas on Base for the approval and deposit. Default 0.0001 ETH.",
  },
];

/* Real costs that none of the limits above cover. */
export const UNCAPPED_COSTS = [
  "L1 data fees that Base and other rollups add on top of execution gas.",
  "Solana account rent.",
  "The Bitcoin network fee on a payment you send from your own wallet.",
] as const;

/* The local record that makes a retry safe. Stated the same way everywhere. */
export const JOURNAL = {
  path: "~/.payhumans/operations",
  facts: [
    "Every --yes run writes a journal of its steps there, named by operation ID.",
    "It holds public data only: recipient handles, addresses, quote and route request IDs, unsigned transaction data, transaction hashes and nonces, your limits, and deposit IDs. It never holds private keys.",
    "Retry protection lives in that journal. Reusing an operation ID resumes the saved operation only while its journal exists, so keep the directory and back it up. If it is deleted, the CLI no longer knows what was already sent.",
    "An operation ID cannot be reused with different parameters, and a wallet lock stops two CLI runs from using one wallet at once. Do not use the same wallet from another tool while an operation is in flight.",
    "A different operation ID is a different payment. Do not answer a timeout by choosing a new ID: inspect the operation and resume it.",
  ],
} as const;

/* Why an order may or may not be seen in the Peer app. */
export const DISCOVERY = {
  visibility:
    "An order can appear in the Peer app once Peer has indexed it, if it passes the app's filters and eligibility rules: a platform and currency the app supports, enough unreserved USDC, a usable exchange rate, a minimum order value (about $1 by default), and the person's own platform, amount and price filters.",
  alerts: `The app's alerts for new orders are opt-in, limited to ${PLATFORM_SETS.alerts.length} platforms (${listOf(PLATFORM_SETS.alerts)}), filtered by price and by a minimum size that defaults to $25, and rate-limited. Delivery has not been verified.`,
} as const;

/* The balances an order reports, in the order money moves through them. */
export const BALANCES: { key: string; name: string; meaning: string }[] = [
  {
    key: "funded",
    name: "Funded",
    meaning: "USDC the agent put into the order.",
  },
  {
    key: "available",
    name: "Available",
    meaning: "USDC nobody has claimed. Open to be claimed, or withdrawn by the agent.",
  },
  {
    key: "reserved",
    name: "Reserved",
    meaning: "USDC held for a person's active claim. Locked until that claim is fulfilled, cancelled, or expires and is cleared.",
  },
  {
    key: "fulfilled",
    name: "Fulfilled",
    meaning: "USDC released from escrow against verified fiat payments. Gross: the people who paid received this less Peer's fees.",
  },
  {
    key: "withdrawn",
    name: "Withdrawn",
    meaning: "USDC the agent took back.",
  },
];

/* What has and has not been proven with real funds. Update only with evidence. */
export const VERIFICATION = {
  asOf: "October 4, 2026",
  verified: [
    "Native SOL, Ethereum ETH and Base ETH each funded a 5 USDC Revolut order on mainnet: deposits 6019, 6020 and 6021. Independent Astra and Claude testers used the published CLI for the Ethereum and Base runs.",
    "Native Bitcoin funded 10 USDC in deposit 6022 through an external Bitcoin wallet and NEAR Intents. Funding and creation completed; unused funds were recovered as Base USDC.",
    "A controlled unpaid 1 USDC claim on deposit 6020 left 4 USDC available. The CLI rejected an over-withdrawal and recovered only those 4 USDC. After we cancelled our own unpaid claim, the remaining 1 USDC was recovered. No fiat was sent.",
    "A 5 USDC withdrawal from deposit 6019 returned 4.763997 USDC to the original Solana wallet after routing costs; a stricter minimum-receive preview rejected the quote safely.",
    "All four new orders matched the current Peer mobile orderbook APIs and recipient checks. Completed operation retries returned the same deposit instead of creating another.",
    "Earlier Solana USDC tests covered deposits 5962, 5968 and 5970, browser claim recovery and returning unused funds to Solana.",
  ],
  unverified: [
    "A real fiat payment followed by payment proof and a USDC payout has not been verified in these PayHumans tests.",
    "Taking a PayHumans order inside the Peer mobile app on a physical device, and delivery of its push alerts.",
    "Arbitrum and Optimism ETH, EVM USDC source routes and direct Base USDC funding remain implemented but not funded-tested in this release.",
  ],
} as const;

export const FAQ = [
  {
    q: "What is PayHumans?",
    a: "A way for an AI agent to get a fiat payment made. The agent funds an order with crypto and names who should be paid. A person sends that payment from their own payment app, proves it, and receives the crypto.",
  },
  {
    q: "Which crypto can fund an order?",
    a: "Mainnet funding tests cover Solana USDC and SOL, Ethereum and Base ETH, and native Bitcoin from an external wallet. Other implemented EVM routes are listed separately as untested. Every new order still needs a live quote. Wrapped bitcoin is not accepted.",
  },
  {
    q: "Where do the funds sit?",
    a: "In Peer's escrow contract on Base, as USDC. Whatever you fund with is converted to USDC on Base first. PayHumans never holds your funds or your keys; the CLI signs with the agent's own wallet.",
  },
  {
    q: "Does creating an order mean the recipient was paid?",
    a: "No. Creating an order only puts crypto in escrow. The recipient is paid when a person claims the order, sends the fiat, and the payment proof is verified. Check the order's status; until it shows a payout, assume nothing was paid.",
  },
  {
    q: "How does a person find my order?",
    a: "People fill orders in the Peer mobile app, where an order can appear as USDC for sale on its payment platform and currency if it passes the app's filters and eligibility rules. Whether someone sees it depends on what they browse and how their alerts are set. There is no guarantee that anyone is notified.",
  },
  {
    q: "What does it cost?",
    a: "Three things: the rate you offer (a person who sends $4.90 against a 5 USDC claim keeps the difference, less Peer's fees), the routing fee to convert your crypto to USDC on Base, and network fees. The preview shows the route quote and your caps before you sign. Some network costs sit outside the caps: L1 data fees, Solana account rent, and your own Bitcoin transaction fee.",
  },
  {
    q: "What if nobody pays?",
    a: "Unclaimed funds stay yours. Withdraw them at any time; they return to your own wallet on Base, and one more command sends them back to a Solana wallet. A claim that is not paid and proven before it expires stops being valid; its funds become available again once Peer clears the expired claim.",
  },
  {
    q: "What risk does the person paying take?",
    a: "They send their own money first. If they pay the wrong recipient or amount, pay before claiming, or prove after the claim expires, the escrow does not release and the fiat cannot be recovered through PayHumans or Peer.",
  },
] as const;
