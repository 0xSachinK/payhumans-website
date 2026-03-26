export const STATS = {
  volume: "$20.8M+",
  platforms: "18+",
  currencies: "35+",
  commands: "88",
} as const;

export const LINKS = {
  docs: "https://docs.peer.xyz",
  github: "https://github.com/zkp2p",
  twitter: "https://twitter.com/peerxyz",
  discord: "https://discord.gg/peer",
  app: "https://peer.xyz",
  cliDocs: "https://docs.peer.xyz/cli",
} as const;

export const CAPABILITIES: {
  name: string;
  command: string;
  status: "live" | "soon";
}[] = [
  { name: "Provide USDC liquidity", command: "peer deposit create", status: "live" },
  { name: "Manage LP positions", command: "peer deposit set-rate", status: "live" },
  { name: "Operate vaults (DRM)", command: "peer vault create", status: "live" },
  { name: "Query market data", command: "peer market spreads", status: "live" },
  { name: "Create checkout links", command: "peer checkout create", status: "live" },
  { name: "Accept fiat payments", command: "Peer Pay SDK", status: "live" },
  { name: "Whitelisted orderbooks", command: "peer intent-hook whitelist set", status: "live" },
  { name: "Transfer USDC", command: "peer transfer", status: "live" },
  { name: "Check balances", command: "peer balance", status: "live" },
  { name: "Buy USDC with fiat", command: "Headless proof gen", status: "soon" },
];

export const FAQ = [
  {
    q: "What is PayHumans.ai?",
    a: "A marketplace where AI agents pay humans in fiat. Agents deposit USDC into escrow and specify a fiat recipient. Human executors send the fiat, prove it cryptographically, and earn the spread. Built on Peer protocol.",
  },
  {
    q: "How do agents pay in fiat?",
    a: "Agent deposits USDC into escrow via the Peer CLI or SDK. A human executor claims the job, sends fiat via Venmo/Wise/Revolut, and proves the payment with a TLS attestation. USDC releases automatically. No trust required.",
  },
  {
    q: "How do I earn as a human executor?",
    a: "Connect your wallet on the Earn page, browse open payment requests from AI agents, claim a job, send the fiat amount, and prove it with the PeerAuth extension. You earn the spread between the USDC escrowed and the fiat you send.",
  },
  {
    q: "Do agents or executors need KYC?",
    a: "No. Fully permissionless. Agents need a wallet and the Peer CLI. Human executors use their existing payment accounts. Verification is cryptographic (TLS attestation), not identity-based.",
  },
  {
    q: "What tokens are supported?",
    a: "USDC on Base (chain 8453). Contracts accept any ERC-20 but the proof pipeline is optimized for USDC.",
  },
  {
    q: "What payment platforms?",
    a: "18+ including Venmo, PayPal, CashApp, Wise, Revolut, Zelle, Monzo, Chime, N26, MercadoPago, Alipay — across 35+ currencies.",
  },
  {
    q: "What is PeerAuth?",
    a: "A browser extension that generates TLS attestation proofs. After you send a fiat payment, PeerAuth captures cryptographic proof directly from the payment platform — no screenshots or manual verification needed.",
  },
  {
    q: "Works with Claude / GPT / OpenClaw?",
    a: "Yes. peer mcp --full starts the MCP server. Add it to your agent's config and get 88 payment tools — quotes, deposits, intents, vaults, market data.",
  },
  {
    q: "What about x402?",
    a: "Our APIs are x402-enabled. Agents pay per request with USDC micropayments. PayHumans complements x402 — x402 for agent-to-agent crypto, PayHumans for the fiat bridge.",
  },
];
