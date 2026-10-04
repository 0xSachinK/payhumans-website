# PayHumans.ai

AI agents fund fiat-payment orders with supported crypto; humans send the fiat from their own payment accounts and receive the escrowed USDC after Peer verifies the payment. Every order settles as USDC on Base in Peer's production escrow contracts.

- Website: https://payhumans.ai
- Product documentation: https://payhumans.ai/docs
- Agent docs: https://payhumans.ai/llms.txt, https://payhumans.ai/llms-full.txt, https://payhumans.ai/agent-guide.json
- Human guide (Peer mobile app): https://payhumans.ai/earn
- Focused deposit CLI: `packages/cli` (`payhumans-ai-cli`, binary `payhumans`)
- Hackathon scope, prior-work disclosure, and judge review path: [HACKATHON.md](HACKATHON.md)

## Development

Use Node.js 24. Copy `.env.example` to `.env.local` and set your public Privy application ID. Allow your exact local origin in that Privy application. Email and passkeys are the supported login methods; embedded EVM wallets are created on login. No Privy secret or wallet signing key belongs on the website server.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3100
npm run lint
npm test
npm run build
cd packages/cli
npm ci
npm test
node src/cli.js --help
```

The included `.npmrc` handles an optional smart-account peer dependency mismatch in Privy. PayHumans uses embedded EOA wallets. A targeted WebSocket override keeps transitive version-8 clients on a patched release without changing version-7 consumers.

## Payment flow

1. The CLI previews or creates an order. It converts the agent's crypto to USDC on Base when needed, then deposits it in Peer escrow with recipient, platform, currency and rate.
2. A person fills the order in the Peer mobile app; `/earn` explains how. The CLI's returned `/earn?deposit=…` link opens the claim page (`/earn/recover`), which resolves current onchain terms and checks the recipient hash against Peer.
3. The claim page also keeps the browser flow working: the executor signs in through Privy and creates an intent. The site simulates and validates the transaction before presenting it to the wallet. Submitted transaction links survive refresh and can recover confirmed intents.
4. The executor sends the exact fiat payment, then captures evidence through the Peer extension. Proof verification precedes the fulfillment transaction and USDC release.
5. An unpaid intent may be cancelled. Agents may withdraw unreserved funds through the CLI.

Mainnet funding was verified with native SOL, Ethereum ETH, Base ETH and native BTC on October 4, plus Solana USDC in earlier testing. Other routes are listed with their status at https://payhumans.ai/docs#routes. Settlement is always USDC on Base; native BTC uses an external Bitcoin wallet and a provider deposit address.

Site facts (routes, platforms, CLI examples, verification status) live in `src/lib/constants.ts`; the HTML pages, `/llms.txt`, `/llms-full.txt` and `/agent-guide.json` all render from it.

## Verification status

Production email login, embedded wallet creation, refresh persistence, logout, and real deposit reads have been verified. Four October 4 mainnet deposits held 25 USDC total. Independent Claude Opus 5.5 and GPT-6 Astra testers used the published CLI with isolated wallets. A controlled unpaid 1-USDC claim preserved the reservation while the owner withdrew the other 4 USDC; after the test claimant cancelled that unpaid claim, the owner recovered the remaining 1 USDC. A separate 5-USDC withdrawal returned 4.763997 USDC to Solana after routing costs.

All four deposits matched the current Peer mobile orderbook API in 20 eligibility checks. This confirms API compatibility, not a current mobile UI or push-notification test. CLI tests cover validation, preview isolation, secret redaction, durable operation recovery, owner history and status units; website tests cover transaction target checks and authenticated contract-event recovery. A real fiat payment, its proof and USDC payout remain unverified in these tests.

The CLI is published as [payhumans-ai-cli](https://www.npmjs.com/package/payhumans-ai-cli). Install the latest release with `npm install -g payhumans-ai-cli` on Node.js 22 or newer. See `packages/cli/README.md` for usage.

## Read-only live claim check

Set `PAYHUMANS_QA_ACCOUNT` to the public address of your test wallet, then run `npm run verify:claim`. It finds a current eligible public deposit, calls the deployed request/intent API, obtains Peer authorization, validates the target, and uses `eth_call` to simulate the claim. It never signs or broadcasts and moves no funds. This check does not prove wallet signing, mined intent creation, or fiat settlement. `PAYHUMANS_SITE_URL` can point to your local server when testing a change.
