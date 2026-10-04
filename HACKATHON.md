# Hackathon development and review guide

PayHumans.ai is an independent personal project. An AI agent funds a fiat-payment order with supported crypto; a human pays the recipient through a supported payment account and proves that payment to receive the escrowed USDC. Orders settle as USDC on Base in Peer's existing production escrow; funding from another chain or asset is a swap or bridge into that.

## Prior work and new development

The repository began on March 27, 2026 as a website prototype. The pre-hackathon baseline is `0c521c0`; its history is retained. Work shipped on October 2 includes:

- Redesigned landing page, workflow diagrams, and PayHumans-specific documentation.
- The published `payhumans-ai-cli@0.1.0` package, limited to platform discovery, deposits, status, and withdrawal.
- Privy email/passkey configuration, embedded-wallet creation, and wallet selection.
- Live escrow reads, on-site intent preparation and signing, transaction simulation and validation, receipt recovery, and unpaid-cancellation controls.
- Peer extension payment-evidence integration.
- Production QA and mobile layout fixes.

Work on October 4 includes a chain-neutral redesign and visual identity, a guide to filling orders in the Peer mobile app at `/earn`, the browser claim page moved to `/earn/recover` with existing `?deposit=`, `?intent=` and `?claimTx=` links redirected to it, and agent documentation at `/llms.txt`, `/llms-full.txt` and `/agent-guide.json`.

Peer supplies existing escrow, verification contracts, and SDK infrastructure. Privy supplies authentication and embedded wallets. Claude contributed landing-page and diagram implementation; Codex implemented integration, CLI, authentication, and QA. Existing infrastructure and the earlier prototype are not claimed as new protocol work.

## Quick review

1. Visit [the website](https://payhumans.ai) and [product docs](https://payhumans.ai/docs).
2. On Node.js 22 or newer, run `npm install -g payhumans-ai-cli`, then `payhumans platforms` and `payhumans routes`.
3. Preview a request with a reviewer-provided recipient. Writes require `--yes`. Signing keys stay in the agent's secret environment, never the website.
4. Visit `/earn` for the Peer mobile app workflow. Open an agent's deposit claim link (or `/earn/recover`) to review current terms; the browser flow there signs in with email. Claiming reserves funds; it does not prove payment.

## Evidence and limits as of October 2

Verified on mainnet with the CLI and the live website:

- An agent Solana wallet funded Peer escrow with Solana USDC through the Peer Cash SDK's Relay route, then opened Venmo request 5962 (5 USDC, rate 0.99) in one CLI flow.
- A human signed in on payhumans.ai with Privy email login and claimed it from the embedded wallet; the intent was mined, shown with recipient, fiat amount and expiry, then cancelled from the site.
- The agent withdrew the unclaimed USDC with the CLI and it returned to the Solana wallet. A second request (5968) ran create and withdraw end to end in single commands.
- npm publication of 0.1.0; CLI unit tests; production email login, embedded-wallet creation, refresh persistence and logout. Mobile layouts were checked at 390 pixels.

Not yet verified: a real fiat payment followed by a payment proof and USDC payout, and device passkey enrollment/login.

## Evidence added October 4

- Four real production deposits: native SOL → 5 USDC (6019), Ethereum ETH → 5 USDC (6020), Base ETH → 5 USDC (6021), and native Bitcoin from an external wallet → 10 USDC (6022). All settled in the existing Base escrow. The native Bitcoin route used the provider deposit-address flow, not wrapped BTC.
- Independent Claude Opus 5.5 and GPT-6 Astra acceptance runs installed the published CLI and used separate low-value wallets. Owner-history and validation findings were fixed in 0.3.2, which includes 32 automated tests.
- A controlled, unpaid 1-USDC claim on 6020 reserved that amount while the owner withdrew 4 available USDC. Withdrawing all 5 while 1 remained reserved was rejected. The known test claimant cancelled only its unpaid claim, then the owner recovered the remaining 1 USDC.
- Separate withdrawals recovered 5 USDC from 6019 and 10 USDC from 6022. Returning the 5 USDC to the Solana source wallet delivered 4.763997 USDC after routing costs; a stricter minimum-receive preview rejected the quote.
- All four deposits passed the current Peer mobile orderbook API in 20 eligibility checks, with the intended Revolut recipient and exact terms. Current mobile UI execution and push delivery were not observed.
- Gross new deployer funding was conservatively accounted at USD 38.49, including funded test-wallet assets, within the USD 100 cap. This is not a claim that all funded assets were consumed as fees.

Actual fiat payment, payment proof and USDC payout remain unverified in this QA. Deposit creation, a reserved claim and an unpaid cancellation are not fiat settlement. Route support and test status are listed separately at https://payhumans.ai/docs#routes. The public demo and founder-pitch URLs, private-repository judge access and the final submission window are separate submission requirements.
