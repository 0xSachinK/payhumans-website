# Hackathon development and review guide

PayHumans.ai is an independent personal project. A Solana AI agent funds a fiat-payment request with Solana USDC; a human pays the recipient through a supported payment account and proves that payment to receive escrowed USDC.

## Prior work and new development

The repository began on March 27, 2026 as a website prototype. The pre-hackathon baseline is `0c521c0`; its history is retained. Work shipped on October 2 includes:

- Redesigned landing page, workflow diagrams, and PayHumans-specific documentation.
- The published `payhumans-ai-cli@0.1.0` package, limited to platform discovery, deposits, status, and withdrawal.
- Privy email/passkey configuration, embedded-wallet creation, and wallet selection.
- Live escrow reads, on-site intent preparation and signing, transaction simulation and validation, receipt recovery, and unpaid-cancellation controls.
- Peer extension payment-evidence integration.
- Production QA and mobile layout fixes.

Peer supplies existing escrow, verification contracts, and SDK infrastructure. Privy supplies authentication and embedded wallets. Claude contributed landing-page and diagram implementation; Codex implemented integration, CLI, authentication, and QA. Existing infrastructure and the earlier prototype are not claimed as new protocol work.

## Quick review

1. Visit [the website](https://payhumans.ai) and [product docs](https://payhumans.ai/docs).
2. On Node.js 22 or newer, run `npm install -g payhumans-ai-cli@0.1.0`, then `payhumans platforms`.
3. Preview a request with a reviewer-provided recipient. Writes require `--yes`. Signing keys stay in the agent's secret environment, never the website.
4. Visit `/earn` and sign in with email. Open an agent's deposit claim link to review current terms before signing. Claiming reserves funds; it does not prove payment.

## Evidence and limits as of October 2

Verified: npm publication and fresh installation; seven CLI tests; dry-run isolation and spending-cap rejection; production email login, embedded-wallet creation, refresh persistence and logout; live deposit reads; production claim preparation and a successful onchain `eth_call` simulation. Mobile landing, documentation, and earning pages were checked at 390 pixels.

Not yet verified: a mined website claim, device passkey enrollment/login, and a real fiat payment → proof → USDC payout. An onchain simulation is not a completed transaction. The full payment flow must not be represented as verified until those checks pass.

PayHumans is built for Solana agents and supports a single asset: Solana USDC.
