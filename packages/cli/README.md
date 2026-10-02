# PayHumans AI CLI

A small interface for Solana agents to fund human-executed fiat payments with Solana USDC. Documentation: https://payhumans.ai/docs

Requires Node.js 22 or newer.

```sh
npm install -g payhumans-ai-cli
payhumans platforms
payhumans wallet
payhumans deposit create --platform venmo --recipient '<recipient-handle>' --amount 5 --currency USD --rate 0.98
```

`--amount` is USDC escrowed. `--rate` is fiat units per USDC: 5 USDC at 0.98 USD/USDC asks the executor to send $4.90. The default minimum and maximum claim size equal the full deposit; use `--min` and `--max` for partial requests.

## Keys and funding

Set `PAYHUMANS_SOLANA_KEY` (base58 secret or Solana CLI JSON array) or `PAYHUMANS_SOLANA_KEY_FILE` through your secret manager. Never paste keys into command arguments or files. The wallet needs the USDC to escrow plus a little SOL for Solana network fees.

`deposit create --yes` moves Solana USDC into Peer escrow through the Peer Cash SDK's Relay route. Your escrow account is derived from your Solana key, so the agent manages a single secret; `payhumans wallet` shows both. Route fees are paid in Solana USDC and shown in the preview. `PAYHUMANS_SOLANA_RPC_URL` and `PAYHUMANS_ESCROW_RPC_URL` optionally override the RPC endpoints; `PAYHUMANS_RELAY_API_KEY` is optional.

Every write is a preview unless `--yes` is supplied. Previews do not sign, broadcast, or register recipient details.

```sh
payhumans deposit create --platform venmo --recipient '<recipient-handle>' --amount 5 --currency USD --rate 0.98 --max-spend 5.5 --yes
payhumans deposit show 123
payhumans deposit list
payhumans deposit withdraw --id 123 --yes      # unclaimed USDC returns to your Solana wallet
payhumans return --yes                         # move any USDC left in the escrow account back to Solana
```

`--max-spend` caps the total Solana USDC spent on one deposit, including route fees. Maintain a separate total budget. Hashes and Relay request IDs are emitted as soon as they exist; reconcile them before retrying a timeout. Confirmed deposits return a direct `https://payhumans.ai/earn?deposit=…` link for a human to claim.

By default the CLI turns off dispute protection on new deposits so any signed-in human can claim without posting stake; the agent accepts payment-reversal risk. Pass `--require-stake` to keep it on. `deposit open-claims --id <id> --platform <name> --yes` applies the same setting to an existing deposit.

The human signs in with email or a passkey to create a PayHumans wallet, claims on the website, sends the fiat from their own account, and proves payment. A claim is not proof or a payout. Platform availability and recipient identity requirements are determined by the protocol, and some platforms require prior identity verification.

This independent PayHumans project uses Peer escrow, the Peer SDK, and the Peer Cash SDK. It intentionally has no swap, vault, transfer, market-making, or broad MCP surface.
