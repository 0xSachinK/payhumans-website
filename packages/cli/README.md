# PayHumans AI CLI

Fund human-executed fiat payments from an agent-owned wallet. PayHumans routes supported crypto into Base USDC and creates a request on Peer's existing production escrow contracts. A human uses Peer mobile to send fiat and prove payment. **Creating a deposit does not prove that anyone has been paid.**

Requires Node.js 22+. No Privy account, hosted wallet or PayHumans API key is required.

```sh
npm install -g payhumans-ai-cli@0.3.1
payhumans routes
payhumans platforms
payhumans deposit create --help
```

Agent guidance: https://payhumans.ai/llms.txt · Documentation: https://payhumans.ai/docs

## Wallets and supported funding

| Source | Assets | Signing / conversion |
| --- | --- | --- |
| Ethereum, Base, Arbitrum, Optimism | Native ETH, native USDC | EVM wallet; Relay converts to Base USDC |
| Polygon | Native USDC | EVM wallet; Relay converts to Base USDC |
| Solana | Native SOL, native USDC | Solana wallet; Relay converts to Base USDC |
| Bitcoin mainnet | Native BTC | External Bitcoin wallet sends to a provider-issued address; resume after conversion |

Base USDC uses the same-chain path. These are implemented routes, not a claim that every route has been tested with funds. `routes --live` discovers current provider capabilities; a fresh quote may reject a route or amount. Wrapped BTC is not native BTC. Arbitrary tokens and networks are rejected.

Configure keys using your secret manager or an existing protected file. Never put a signing key in command arguments, chat, logs or the repository.

- EVM: `PAYHUMANS_EVM_KEY` or `PAYHUMANS_PRIVATE_KEY`; file: `PAYHUMANS_EVM_KEY_FILE` or `PAYHUMANS_PRIVATE_KEY_FILE`. Files accept a raw `0x` private key or JSON with `privateKey`.
- Solana: `PAYHUMANS_SOLANA_KEY` or `PAYHUMANS_SOLANA_KEY_FILE`. Accepts base58, a Solana CLI JSON array, or `{ "secretKey": [...] }`.
- Bitcoin: this CLI never takes a Bitcoin private key. An EVM key owns the destination escrow, and your external Bitcoin wallet signs its source payment.

For EVM funding, the same EVM address owns the Base deposits. Solana funding deterministically derives the Base owner from the Solana key. Keep the same key to recover those deposits. No private key is written into operation journals.

```sh
payhumans wallet --source-chain ethereum --source-asset ETH
payhumans wallet --source-chain solana --source-asset SOL
```

RPC overrides: `PAYHUMANS_RPC_<chainId>` (for example `PAYHUMANS_RPC_1`), `PAYHUMANS_EVM_RPC_URL` for the selected EVM source, `PAYHUMANS_ESCROW_RPC_URL` for Base, `PAYHUMANS_SOLANA_RPC_URL` for Solana. Each EVM RPC is checked against its expected chain before signing. `PAYHUMANS_RELAY_API_KEY` and `PAYHUMANS_NEAR_INTENTS_TOKEN` are optional secret environment variables; no privileged credentials ship in the package.

## Recipient onboarding and payment terms

`platforms` reads the production Peer catalog, including supported fiat currencies and recipient hints. The CLI supports the catalog's deposit platforms; mobile app availability, enrollment and verifier requirements can differ. Confirm the human workflow for the chosen platform in the website documentation.

```sh
payhumans recipient validate --platform revolut --recipient '<verified-revtag>'
payhumans recipient register --platform revolut --recipient '<verified-revtag>'
payhumans recipient register --platform revolut --recipient '<verified-revtag>' --yes
payhumans recipient show --platform revolut --hash '<registered-payee-hash>'
```

Validation checks identifier format; it does **not** identify the recipient as someone you know. Confirm the exact platform and handle with the intended recipient. `recipient register --yes` registers recipient details with Peer but sends no crypto. PayPal, Wise and Alipay require recipient identity attestation for new registrations. The recipient starts registration and Peer extension setup at https://app.peer.xyz/sell?tab=advanced. Platform-specific verification is at https://app.peer.xyz/sell/wise for Wise and https://app.peer.xyz/sell/paypal for PayPal. An existing verified registration can be reused. Venmo receipt connection and other platform enrollment can also affect human fulfillment. The CLI surfaces registration failures before funding.

`--amount` is USDC escrowed. `--rate` is fiat units per USDC. `--amount 5 --currency USD --rate 0.98` requests $4.90 if the entire deposit fills. Partial fills may result in separate fiat payments. Default `--min` is 1 USDC or the full amount when smaller; default `--max` is the full deposit. Set both explicitly when required. Exact whole-deposit claim bounds may not match mobile net-amount quotes because of protocol fees.

## Preview, bound spending, execute once

Every crypto write is a preview unless `--yes` is supplied. Keyless creation gives a terms-only preview; configure the wallet for live balances and funding quotes. Previews validate recipient format but do not register it or sign transactions.

```sh
payhumans deposit create \
  --source-chain ethereum --source-asset ETH \
  --platform revolut --recipient '<verified-revtag>' \
  --amount 5 --currency USD --rate 0.98 \
  --max-source-spend 0.0023 --max-source-gas 0.00015 \
  --max-base-gas 0.0001 --max-route-fee-usd 1 --slippage-bps 50

# Execute only after checking the preview. Use ONE ID for this payment and every retry.
payhumans deposit create \
  --source-chain ethereum --source-asset ETH \
  --platform revolut --recipient '<verified-revtag>' \
  --amount 5 --currency USD --rate 0.98 \
  --max-source-spend 0.0023 --max-source-gas 0.00015 \
  --max-base-gas 0.0001 --max-route-fee-usd 1 --slippage-bps 50 \
  --operation-id invoice-2026-001 --yes
```

Example cap values illustrate the syntax; obtain a live quote and fit caps to your actual budget. Every signed create requires `--operation-id` and a source spend cap. `--max-spend` is a compatible source cap alias when the source is USDC; it also caps deposit principal.

- `--max-source-spend`: cumulative input of source-asset routing, including fees priced into the input and any Base gas purchase. It excludes separately paid network gas. Direct Base USDC creation caps the USDC deposit amount.
- `--max-source-gas`: aggregate source execution-gas ceiling; default 0.002 SOL or 0.001 native EVM units. This is a ceiling, not a mandatory reserve. Actual transaction gas is checked before signing.
- `--max-base-gas`: aggregate Base execution-gas ceiling, default 0.0001 ETH. Chain-specific L1 data charges and Solana account rent can be additional; reserve a separate small network-cost margin.
- `--max-route-fee-usd`: route service/gas fees charged by the routing provider, default $2. Source network gas is separate. For BTC this bounds quoted source-dollar cost minus destination-dollar value.
- `--slippage-bps`: provider slippage policy, default 50; accepts 0–100. Exact output and source spend limits are checked before any route is saved/signed.

The CLI reuses USDC already in the owning Base wallet. If needed, EVM/Solana routes buy Base ETH for deposit approvals and gas. Direct Base and external BTC flows require existing Base ETH (at least 0.00002 ETH preflight; actual gas can cost more). Approvals are exact-amount approvals, never unlimited allowances.

By default, new requests disable dispute protection so claimants need no stake. The depositor accepts payment reversal risk. Use `--require-stake` to keep it enabled. An interrupted post-deposit setting change can be resumed without another deposit.

## Interrupted operation recovery

```sh
payhumans operations list
payhumans operations show invoice-2026-001
payhumans operations resume invoice-2026-001       # review saved action and limits
payhumans operations resume invoice-2026-001 --yes
```

Public metadata is saved under `~/.payhumans/operations` (override `PAYHUMANS_STATE_DIR`). This includes recipient handles, addresses, quote IDs, unsigned public transaction data, hashes/nonces, spending limits and deposit IDs. Files are private to the local user; back up this directory because deleting it removes the CLI's retry protection. It does not contain private keys or signed raw EVM transactions. Solana journals contain unsigned transaction messages and public signatures.

A wallet lock excludes concurrent operations. A persisted operation ID cannot be reused with different parameters. EVM transaction hashes and nonces are saved before broadcast; retries check the original hash and may rebroadcast the exact same transaction. Relay route status is reconciled before sending. Solana instructions and the original signed transaction identity are retained across retries. If an unobserved Solana transaction's blockhash has expired, the CLI stops for reconciliation rather than sending another funding transfer. Do not solve a timeout by choosing a new operation ID.

Different operation IDs deliberately authorize different payments. Do not run this wallet in another tool concurrently. An unknown/replaced transaction or terminal failed/refunded route requires reconciliation; inspect provider transaction evidence before a new payment. A completed operation returns its original deposit ID.

## Native Bitcoin with your external wallet

```sh
payhumans deposit create \
  --source-chain bitcoin --source-asset BTC \
  --platform revolut --recipient '<verified-revtag>' \
  --amount 10 --currency USD --rate 0.98 \
  --refund-address '<your-valid-mainnet-BTC-address>' \
  --max-source-spend 0.00015 --max-route-fee-usd 2
# Repeat with --operation-id btc-invoice-001 --yes after review.
# Send the exact returned BTC amount ONCE to externalFunding.depositAddress.
payhumans operations resume btc-invoice-001 --yes
```

The external route uses the Peer Cash SDK's NEAR Intents integration and canonical native Bitcoin. The provider minimum varies; a $5 quote was rejected and a $10 read-only quote succeeded during verification. A successful preview is not a funded BTC test.

`--yes` first validates/registers the recipient, checks Base gas and saves a unique provider quote. It returns `awaiting-external-funding` with BTC amount, deposit address, any memo, deadline, refund address and ETA. The CLI does **not** send BTC. External Bitcoin transaction fees are additional and must stay in your total budget. Never send after the deadline or to an old quote. Resume polls the saved provider address and only creates the Peer deposit after the provider reports the expected route successful and the Base USDC is present. Never send a second BTC payment on a pending, incomplete or expired quote. Failed routes may refund less than sent because of provider/network fees; inspect `operations show` and the refund address. Bitcoin confirmations may take substantially longer than EVM/Solana routing.

## Status, partial fills and withdrawal

```sh
payhumans deposit show 123
payhumans deposit list --owner '0xYourDepositOwner'
# Poll show periodically (for example every 15 seconds) until state/intent status changes.
payhumans deposit withdraw --id 123 --source-chain ethereum --source-asset ETH
payhumans deposit withdraw --id 123 --source-chain ethereum --source-asset ETH \
  --operation-id recover-invoice-001 --yes
```

`show` exposes funded, available, reserved, fulfilled and withdrawn USDC amounts. `intents` includes individual intent hashes, amounts, status, expiry and available verified payment receipt fields. Deposit ID is the on-chain numeric identifier; composite ID is `escrowAddress_depositId`; each individual human claim has an `intentHash`. The owning wallet is not the fiat recipient. On-chain liquidity and indexed history can update at different times; source/freshness is reported.

`SIGNALED` is a reservation, not proof of fiat payment. `FULFILLED` indicates contract release; inspect payment receipt fields for evidence. Indexer failures return unknown historical fields rather than invented zeroes. Withdrawn/closed deposits can remain readable through indexed history.

Withdrawal defaults to **all available liquidity**, validates that availability in the preview, and leaves USDC in the owner's Base wallet. `--amount` withdraws part. Reserved claims are never cancelled or withdrawn by this CLI. An expired claim can still need protocol pruning or dispute resolution; inspect its status in Peer before acting. Deposits do not have an automatic payment deadline; withdraw available liquidity to stop offering it. Each withdrawal also uses a durable operation ID.

For a Solana-derived owner, return recovered Base USDC to the same Solana wallet separately:

```sh
payhumans return --amount 5
payhumans return --amount 5 --min-receive 4.8 --operation-id return-invoice-001 --yes
```

The return quote must meet `--min-receive`. EVM owners already control their withdrawn Base USDC directly. Returning Base funds to Bitcoin is not implemented; provider BTC refunds cover failed inbound routes only.

## Humans and notifications

The primary human path is **Peer mobile → P2P tab → USD → Revolut** for a USD Revolut request; choose the matching currency and platform for other requests. **Buy USDC** and **Snipe/rate alerts** provide alternative discovery paths. Available rates, recipient enrollment, net/gross claim bounds, liquidity thresholds and stake requirements affect discovery. Snipe/rate alerts require opt-in and matching filters; a new deposit does not guarantee a push notification. Existing PayHumans deposit links retain context at `/earn?deposit=<id>`. No fiat payment, proof or payout is fabricated by the CLI.

## Agent output contract

Success is JSON on stdout. Errors are JSON on stderr with `error.code` and `error.message`, nonzero exit status, and remediation where available. Help/version output is plain text. `RECIPIENT_REGISTRATION_REQUIRED` directs the recipient to Peer verification. `REQUEST_FAILED` preserves the actionable provider error when available. No interactive prompts occur. Keep a separate task-wide spending ledger; per-operation caps do not authorize repeated payments or a larger overall budget.

PayHumans is an independent product built with Peer contracts, the Peer SDK, Peer Cash SDK, Relay and NEAR Intents. Their public technical identifiers and attribution remain intact.
