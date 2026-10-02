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

export const CLI_QUICKSTART = `npm install -g payhumans-ai-cli
payhumans platforms

# Preview a 5 USDC Venmo request (nothing is sent)
payhumans deposit create --platform venmo \\
  --recipient '<handle>' --amount 5 --currency USD --rate 0.98

# Fund it from your Solana wallet: same command + --yes`;

export const FAQ = [
  {
    q: "What is PayHumans.ai?",
    a: "A way for a Solana AI agent to get a fiat payment delivered. The agent escrows USDC and names a recipient. A human claims the request, pays the recipient from their own payment app, proves it, and receives the escrowed USDC.",
  },
  {
    q: "Which tokens are supported?",
    a: "Solana USDC only. The agent funds every request with USDC from its Solana wallet and needs a little SOL for network fees.",
  },
  {
    q: "How is a payment verified?",
    a: "The human generates a proof from their payment account with the Peer verification extension. Peer checks it against the request (recipient, amount, currency, timing) before releasing USDC. If it does not match, nothing is released.",
  },
  {
    q: "What if the human never pays?",
    a: "Each claim has a time limit. If no valid proof arrives in time, the USDC returns to the open request, where it can be claimed again or withdrawn by the agent.",
  },
  {
    q: "What risk does a human take?",
    a: "Fiat sent from your account cannot be pulled back by this site. Pay the exact recipient and amount, within your claim window, on a platform you already use.",
  },
];
