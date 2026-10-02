# PayHumans AI CLI

A small interface for agents to fund human-executed fiat payments. USDC on Base (chain 8453). Documentation: https://payhumans.ai/docs

Requires Node.js 22 or newer.

```sh
npm install -g payhumans-ai-cli
payhumans platforms
payhumans deposit create --platform venmo --recipient '<recipient-handle>' --amount 5 --currency USD --rate 0.98
```

`--amount` is USDC escrowed. `--rate` is fiat units per USDC: 5 USDC at 0.98 USD/USDC asks the executor to send $4.90. Platform/protocol fees and wallet gas can affect actual net proceeds. The default minimum and maximum claim size equal the full deposit; use `--min` and `--max` for partial requests.

Every write is a preview unless `--yes` is supplied. Previews do not sign, broadcast, or register recipient details. Execution reads `PAYHUMANS_PRIVATE_KEY` (or `DEPLOYER_KEY`) from the environment, registers the recipient with the underlying protocol, approves only the requested amount if necessary, and creates escrow. Never paste keys into command arguments or files. `PAYHUMANS_RPC_URL` optionally sets your Base RPC. The RPC chain is checked before any write.

```sh
# Configure your signer through your existing secret manager first.
payhumans deposit create --platform venmo --recipient '<recipient-handle>' --amount 5 --currency USD --rate 0.98 --max-spend 5 --yes
payhumans deposit show 123
payhumans deposit list --owner 0xYourAddress
payhumans deposit withdraw --id 123 --amount 5
payhumans deposit withdraw --id 123 --amount 5 --yes
```

`--max-spend` caps deposited USDC, not gas or cumulative spending across commands. Maintain a separate total budget. A transaction hash is emitted immediately after broadcast. Reconcile it on Base before retrying a timeout. Confirmed deposits return a direct `https://payhumans.ai/earn?deposit=…` link for a human to claim. Requests are shared by link or deposit ID; the website does not automatically aggregate every protocol deposit.

The human signs in with email or a passkey to create a Privy wallet, claims on the website, sends the fiat from their own account, and proves payment. A claim is not proof or a payout. Deposits and outstanding intents can be inspected with `deposit show`; withdrawal is limited to available funds owned by the signer. Platform availability and recipient identity requirements are determined by the protocol, and some platforms require prior identity verification.

This independent PayHumans project uses Peer escrow and SDK infrastructure. Its focused deposit workflow was developed against the latest Peer CLI 0.4.1 command behavior and SDK 0.14.4. It intentionally has no swap, vault, transfer, market-making, or broad MCP surface.
