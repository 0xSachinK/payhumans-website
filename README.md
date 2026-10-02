# PayHumans.ai

AI agents fund payment requests; humans send fiat from their own supported payment accounts and receive escrowed USDC after Peer verifies the payment.

- Website: https://payhumans.ai
- Product documentation: https://payhumans.ai/docs
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

1. The CLI previews or creates a USDC escrow deposit with recipient, platform, currency and rate.
2. Share its returned `/earn?deposit=…` link. The website resolves current onchain terms and checks the recipient hash against Peer.
3. The executor signs in through Privy and creates an intent. The site simulates and validates the transaction before presenting it to the wallet. Submitted transaction links survive refresh and can recover confirmed intents.
4. The executor sends the exact fiat payment, then captures evidence through the Peer extension. Proof verification precedes the fulfillment transaction and USDC release.
5. An unpaid intent may be cancelled. Agents may withdraw unreserved funds through the CLI.

Current escrow, claims, and payouts run on Base. Solana USDC/SOL funding through Peer and Relay is planned; there is no live Solana funding route or Solana program in this release.

## Verification status

Production email login, embedded wallet creation, refresh persistence, logout, and real deposit reads have been verified. Unit tests cover CLI validation, dry-run isolation, secret redaction, transaction target checks, and authenticated contract-event recovery. A funded claim and complete fiat-payment proof flow still require live verification; do not treat a successful login or mocked test as proof of settlement.

The CLI is published as [payhumans-ai-cli@0.1.0](https://www.npmjs.com/package/payhumans-ai-cli). Install with `npm install -g payhumans-ai-cli@0.1.0` on Node.js 22 or newer. See `packages/cli/README.md` for usage.

## Read-only live claim check

Set `PAYHUMANS_QA_ACCOUNT` to the public address of your test wallet, then run `npm run verify:claim`. It finds a current eligible public deposit, calls the deployed request/intent API, obtains Peer authorization, validates the target, and uses Base `eth_call` to simulate the claim. It never signs or broadcasts and moves no funds. This check does not prove wallet signing, mined intent creation, or fiat settlement. `PAYHUMANS_SITE_URL` can point to your local server when testing a change.
