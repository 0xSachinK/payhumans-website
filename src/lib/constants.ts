export const LINKS = {
  docs: "/docs",
  cliDocs: "/docs#quickstart",
  earn: "/earn",
  app: "/earn",
  buildLab: "https://luma.com/superteam-5ffe",
} as const;

export const CLI = {
  packageName: "payhumans-ai-cli",
  bin: "payhumans",
} as const;

export const CLI_QUICKSTART = `# Install with Node.js 22 or newer
npm install -g payhumans-ai-cli@0.1.0

# Requires USDC + a little SOL for fees in a Solana wallet
# Supported platforms and currencies (varies; always query)
payhumans platforms

# Preview a request (dry run by default, nothing is sent)
payhumans deposit create --platform venmo \\
  --recipient '<handle>' --amount 5 --currency USD --rate 0.98

# Execute: same command plus --yes. The signer comes from
# PAYHUMANS_PRIVATE_KEY or DEPLOYER_KEY in your env. Never paste keys.
payhumans deposit create --platform venmo \\
  --recipient '<handle>' --amount 5 --currency USD --rate 0.98 --yes`;

export const CLI_COMMANDS: { command: string; desc: string }[] = [
  { command: "payhumans platforms", desc: "List payment platforms and currencies currently supported." },
  { command: "payhumans deposit create", desc: "Escrow Solana USDC for a fiat payment. --amount is USDC, --rate is fiat per USDC." },
  { command: "payhumans deposit show <id>", desc: "Check whether a request is open, claimed, or settled." },
  { command: "payhumans deposit withdraw --id <id> --amount 5", desc: "Reclaim USDC that has not been paid out." },
];

export const FAQ = [
  {
    q: "What is PayHumans.ai?",
    a: "A way for an AI agent holding USDC on Solana to get a fiat payment delivered to someone. The agent escrows USDC and names a recipient. A human claims the request, pays the recipient from their own payment account, proves the payment, and receives the escrowed USDC.",
  },
  {
    q: "Who spends what?",
    a: "The human spends fiat (for example USD via Venmo) and receives USDC. The agent spends USDC and gets a fiat payment delivered. The agent's offered exchange rate determines how much USDC the human receives per unit of fiat sent; that difference is the human's reward.",
  },
  {
    q: "Which payment platforms work?",
    a: "It depends on the platform and currency, and support can change. Run payhumans platforms to see what is currently available before creating a request. Do not assume a platform works because it appears elsewhere.",
  },
  {
    q: "How is a payment verified?",
    a: "The human uses a protocol payment-verification browser extension to produce a proof from their payment account. The escrow contract checks the proof against the request (recipient, amount, currency, timing) before releasing USDC. If the proof does not match, nothing is released.",
  },
  {
    q: "What if the human never pays?",
    a: "Each claim has a time limit. If no valid proof arrives before it expires, the claim lapses and the USDC returns to the open request, where it can be claimed again or withdrawn by the agent.",
  },
  {
    q: "What risks does a human take?",
    a: "Fiat sent from your account cannot be pulled back by this site. If you pay the wrong recipient, the wrong amount, or after your claim expires, the proof may fail and the escrow will not pay you. Only claim requests you can complete inside the window, on a platform you already use.",
  },
  {
    q: "Which tokens and chains are supported?",
    a: "Solana USDC only. An agent funds every request with USDC from its Solana wallet. Other tokens are not accepted.",
  },
  {
    q: "What does an agent need?",
    a: "A Solana wallet holding the USDC it wants to escrow plus a little SOL for network fees, and a signing key kept in its environment.",
  },
  {
    q: "Who runs this?",
    a: "PayHumans.ai is an independent project. Escrow and payment verification use the Peer protocol; this site does not custody funds.",
  },
];
