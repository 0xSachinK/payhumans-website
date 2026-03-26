# PayHumans.ai — Agent-Pays-Human Implementation Brief

## Product Pivot

PayHumans is **not** an LP deposit page. It's a marketplace where **AI agents pay humans in fiat**.

## Core Framing

- **"PayHumans" = agents pay humans in fiat**
- Agent is the CUSTOMER (has USDC, wants fiat delivered to a recipient)
- Human is the SERVICE PROVIDER (executes fiat payments, earns USDC spread)
- This maps to ZKP2P off-ramp: agent = maker (deposits USDC), human executor = taker (sends fiat, proves it, receives USDC)

## Two User Paths

### Path 1: Agent Developer ("I'm building an agent")
- Agent deposits USDC into escrow via Peer CLI or SDK
- Specifies: recipient, payment platform, currency, amount
- A human executor picks up the job
- **This path is already well-served by the landing page + CLI showcase**
- Enhancement: Add a "Create Payment Request" flow where agents can create off-ramp requests

### Path 2: Human Executor ("I want to earn")
- Human signs up to be available as a fiat executor
- Browses available payment jobs (agent off-ramp requests)
- Claims a job, sends fiat via Venmo/Wise/Revolut/etc.
- Proves payment with TLS attestation (via PeerAuth browser extension)
- Receives USDC from escrow (minus spread = their earnings)

## What to Build

### Page: `/earn` (Human Executor Signup + Job Board)

**Section 1: Hero**
- "Earn crypto by sending payments for AI agents"
- "You have a bank account. AI agents don't. Get paid to be their fiat hands."
- CTA: "Connect Wallet & Start Earning"

**Section 2: How It Works (3 steps)**
1. Connect wallet + install PeerAuth extension
2. Browse open payment requests from agents
3. Send fiat, prove it, receive USDC

**Section 3: Available Payment Requests (Job Board)**
- Pull from ZKP2P indexer: active deposits that are accepting intents
- Show: amount (USDC), platform (Venmo/Wise/etc.), currency, spread/earnings
- Filter by platform, currency, amount range
- Each card = a payment job an agent has posted

**Section 4: Claim & Execute Flow**
- Human clicks "Claim" on a job
- Wallet popup to sign `signalIntent()` transaction
- Instructions: "Send [amount] via [platform] to [recipient]"
- After sending: "Prove your payment" → opens PeerAuth extension
- Extension generates TLS attestation proof
- Submit proof → attestation service → `fulfillIntent()` → USDC released

### Page: `/request` (Agent Payment Request — Optional)
- Simpler: agent creates an off-ramp request via web UI
- Connect wallet, deposit USDC, specify recipient + platform + currency
- This uses `createDeposit()` from the SDK
- Could be Phase 2 — agents already have CLI for this

## Technical Notes

### Reading Available Jobs (Indexer)
```graphql
query {
  deposits(where: {
    acceptingIntents: true,
    remainingDeposits_gt: "0"
  }) {
    id
    depositor
    token
    remainingDeposits
    intentAmountRange
    paymentMethods { method, currencies { code, minConversionRate } }
  }
}
```

### Claiming a Job (SDK)
```typescript
const { hash } = await client.signalIntent({
  depositId,
  amount,        // USDC amount to receive
  paymentMethod, // e.g., keccak256("wise")
  fiatCurrency,  // e.g., keccak256("USD")
  // ... payee details
});
```

### Proving Payment (PeerAuth Extension)
- Extension SDK: `@zkp2p/sdk` exports `createPeerExtensionSdk()`, `isPeerExtensionAvailable()`
- After human sends fiat, extension captures TLS proof
- Proof submitted to attestation service → EIP-712 signature
- `fulfillIntent()` called with attestation

### Dependencies
- wagmi + RainbowKit (wallet connection)
- @zkp2p/sdk (protocol interaction)
- @tanstack/react-query (data fetching from indexer)
- PeerAuth extension SDK (proof generation)

## SDK Reference
- Full SDK docs: `../zkp2p-clients/packages/sdk/CLAUDE.md`
- Client source: `../zkp2p-clients/packages/sdk/src/client/Zkp2pClient.ts`
- React hooks: `../zkp2p-clients/packages/sdk/src/react/`
- Indexer queries: `../zkp2p-clients/packages/sdk/src/indexer/queries.ts`
- Extension SDK: `../zkp2p-clients/packages/sdk/src/extension.ts`

## Design Direction
- Same dark theme as landing page (#050505, blue accent, Geist fonts)
- Job board should feel like a task marketplace (cards with key info)
- Claim flow should be step-by-step with clear progress
- Extension install prompt if PeerAuth not detected

## After Implementation
1. Run Codex review loop until no P0/P1/P2 findings
2. Run 5-round QA loop with Chrome MCP screenshots
3. Commit after every phase
4. Push to GitHub
5. Then trigger Dario Growth for launch article

## Landing Page Updates Needed
- Update hero CTAs: "I'm building an agent" + "I want to earn"
- Update ForLPs section to match "human executor" framing instead of "LP" framing
- Update FAQ answers to reflect agent-pays-human model
- Add "Earn" nav link pointing to /earn page
