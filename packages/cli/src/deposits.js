import { Zkp2pClient, getContracts, getPaymentMethodsCatalog, apiValidatePayeeDetails, apiGetPayeeDetails } from '@zkp2p/sdk';
import { createCashClient, deriveCashOrder, nearIntentsQuoteFromJson, nearIntentsQuoteToJson } from '@zkp2p/cash';
import { erc20Abi, encodeFunctionData, formatUnits, isAddress, parseEther, parseEventLogs } from 'viem';
import { ESCROW_USDC, quoteSummary, relayClient } from './solana.js';
import { decimal, validateCreate, InvalidArgumentError, errorOutput, GAS_PREVIEW_NOTE } from './core.js';
import { fundingWallet, fundingCash, sourceRoute, sourceBalances, displayBalances, evmClients, limits, assertQuote, assertSpendBudget, bitcoinAddress, NATIVE } from './funding.js';
import { openOperation, saveOperation, withWalletLock } from './operations.js';
import { evmTransaction, executeRelayRoute } from './transactions.js';

export const MIN_BASE_GAS = parseEther('0.00002');
const GAS_TOPUP = parseEther('0.00005');
export function sdkClient(account) {
  const clients = evmClients(8453, account ?? '0x0000000000000000000000000000000000000001');
  return new Zkp2pClient({ walletClient: clients.walletClient, chainId: 8453, runtimeEnv: 'production', rpcUrl: clients.rpcUrl, baseApiUrl: 'https://api.zkp2p.xyz' });
}
export const escrowAddress = c => c.getDeployedAddresses().escrowV2 ?? c.getDeployedAddresses().escrow;
export async function baseBalances(account) {
  const c = evmClients(8453, account);
  if (await c.publicClient.getChainId() !== 8453) throw new Error('Base RPC chain mismatch.');
  const [usdc, gas] = await Promise.all([c.publicClient.readContract({ address: ESCROW_USDC, abi: erc20Abi, functionName: 'balanceOf', args: [account.address] }), c.publicClient.getBalance({ address: account.address })]);
  return { usdc, gas };
}
export async function validateRecipient(platform, recipient) {
  const response = await apiValidatePayeeDetails({ processorName: platform, offchainId: recipient }, 'https://api.zkp2p.xyz', 20000);
  if (!response.success || !response.responseObject?.isValid) throw new Error(response.message || response.responseObject?.errors?.join(', ') || 'Recipient validation failed.');
  return { platform, recipient, validFormat: true, identityVerified: false, note: 'Format validation does not verify that this is your intended recipient. Confirm the payment handle with the recipient.' };
}
export async function recipientDetails(platform, hash) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new InvalidArgumentError('Recipient hash must be a bytes32 hex value.');
  const response = await apiGetPayeeDetails({ processorName: platform, hashedOnchainId: hash }, 'https://api.zkp2p.xyz', 20000);
  if (!response.success) throw new Error(response.message);
  return response.responseObject;
}
function depositParams(p) {
  return { token: ESCROW_USDC, amount: p.amount, intentAmountRange: { min: p.min, max: p.max }, processorNames: [p.platform], payeeData: [{ offchainId: p.recipient }], conversionRates: [[{ currency: p.currency, conversionRate: p.rate.toString() }]] };
}
function publicOptions(opts, route) {
  return Object.fromEntries(Object.entries({ ...opts, sourceChain: route.chain, sourceAsset: route.asset }).filter(([key,value]) => !['yes','operationId'].includes(key) && value !== undefined));
}
function requestedPlan(p, route) {
  return { source: route, settlement: { chainId: 8453, asset: 'USDC', token: ESCROW_USDC }, platform: p.platform, recipient: p.recipient, amount: formatUnits(p.amount, 6), currency: p.currency, fiatPerUsdc: formatUnits(p.rate, 18), fiatForFullDeposit: formatUnits(p.amount * p.rate, 24), minimumClaim: formatUnits(p.min, 6), maximumClaim: formatUnits(p.max, 6), gasWarning: GAS_PREVIEW_NOTE, note: 'A funded deposit is a request, not a fiat payment. Humans select compatible orders in Peer mobile. Partial fills may send separate fiat payments.' };
}
function routeFeeUnits(raw) {
  // Relay exposes gas separately; cap protocol + relayer fees, excluding source network gas (separately bounded).
  const amount = Number(raw.fees?.relayer?.amountUsd ?? (Number(raw.fees?.relayerGas?.amountUsd ?? 0) + Number(raw.fees?.relayerService?.amountUsd ?? 0))) + Number(raw.fees?.app?.amountUsd ?? 0);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Malformed route fees.');
  return BigInt(Math.ceil(amount * 1e6));
}
async function newRelayRoute(wallet, cash, amount, gas = false) {
  const raw = gas ? await (await relayClient()).actions.getQuote({ chainId: wallet.route.chainId, currency: wallet.route.address, user: wallet.address, recipient: wallet.account.address, toChainId: 8453, toCurrency: NATIVE, amount: amount.toString(), tradeType: 'EXACT_OUTPUT' }, false) : (await cash.quoteSource({ source: { chainId: wallet.route.chainId, currency: wallet.route.address }, user: wallet.address, recipient: wallet.account.address, amount, tradeType: 'EXACT_OUTPUT' })).raw;
  const checked = assertQuote(raw, wallet, { address: gas ? NATIVE : ESCROW_USDC }, amount);
  return { provider: 'relay', input: checked.input.toString(), output: checked.output.toString(), requestId: checked.requestId, quote: raw, summary: quoteSummary(raw), feeUsdUnits: routeFeeUnits(raw).toString(), status: 'quoted' };
}
function enforceRoutes(op, additional, caps) {
  assertSpendBudget(op, BigInt(additional?.input ?? 0), caps.sourceSpend);
  const fees = Object.values(op?.routes ?? {}).reduce((s,r) => s + BigInt(r.feeUsdUnits ?? 0), 0n) + BigInt(additional?.feeUsdUnits ?? 0);
  if (fees > caps.routeFeeUsd) throw new Error('Route fees exceed --max-route-fee-usd.');
}
async function bitcoinRoute(wallet, cash, amount, opts, caps, dry) {
  if (!bitcoinAddress(opts.refundAddress)) throw new InvalidArgumentError('--refund-address must be your Bitcoin mainnet refund address for external BTC funding.');
  const capabilities = await cash.nearIntentsCapabilities();
  const asset = capabilities.assets.find(a => a.assetId === '1cs_v1:btc:native:coin') ?? capabilities.assets.find(a => a.assetId === 'nep141:btc.omft.near');
  if (!asset || asset.decimals !== 8 || asset.blockchain !== 'btc') throw new Error('Provider is not advertising canonical native Bitcoin.');
  const quote = await cash.quoteNearIntentsSource({ sourceAsset: asset.assetId, amount, recipient: wallet.account.address, refundTo: opts.refundAddress, tradeType: 'EXACT_OUTPUT', deadline: new Date(Date.now() + 30 * 60_000).toISOString(), slippageTolerance: caps.slippageBps, dry });
  if (quote.minOutputAmount < amount || quote.inputAmount <= 0n) throw new Error('Bitcoin quote does not guarantee the requested Base USDC output.');
  if (caps.sourceSpend !== null && quote.inputAmount > caps.sourceSpend) throw new Error('Bitcoin amount exceeds --max-source-spend.');
  const quoteRaw = quote.raw?.quote ?? {};
  const feeUsd = Math.max(0, Number(quoteRaw.amountInUsd ?? 0) - Number(quoteRaw.amountOutUsd ?? 0));
  if (!Number.isFinite(feeUsd)) throw new Error('Bitcoin quote returned malformed fee metadata.');
  const feeUsdUnits = BigInt(Math.ceil(feeUsd * 1e6));
  if (feeUsdUnits > caps.routeFeeUsd) throw new Error('Bitcoin quote fee/price impact exceeds --max-route-fee-usd.');
  return { provider: 'near-intents', sourceAsset: asset.assetId, feeUsdUnits: feeUsdUnits.toString(), input: quote.inputAmount.toString(), output: quote.minOutputAmount.toString(), quote: nearIntentsQuoteToJson(quote), status: 'quoted', summary: { pay: `${formatUnits(quote.inputAmount, 8)} BTC`, receive: `${formatUnits(quote.minOutputAmount, 6)} USDC`, depositAddress: quote.depositAddress ?? null, depositMemo: quote.depositMemo ?? null, deadline: new Date(Math.min(new Date(quote.request.deadline).getTime(), new Date(quote.deadline ?? quote.request.deadline).getTime())).toISOString(), providerDeadline: quote.deadline ?? null, refundAddress: opts.refundAddress, estimatedFeeAndPriceImpactUsd: formatUnits(feeUsdUnits, 6), refundFeeSourceUnits: quoteRaw.refundFee ?? null, withdrawalFeeSourceUnits: quoteRaw.withdrawFee ?? null, etaSeconds: quote.timeEstimateSeconds ?? null, note: 'Send this exact BTC amount once from your own Bitcoin wallet. External Bitcoin network fees are additional; keep them within your budget. Never send after the deadline.' } };
}
async function reconcileBitcoin(op, cash) {
  const route = op.routes.funding;
  if (route.status === 'success') return true;
  const quote = nearIntentsQuoteFromJson(route.quote);
  const status = await cash.nearIntentsStatus({ depositAddress: quote.depositAddress, depositMemo: quote.depositMemo, expectedQuote: quote });
  route.lastStatus = status.status;
  route.evidence = { originTransactions: status.originTransactions, destinationTransactions: status.destinationTransactions, refundedAmount: status.refundedAmount?.toString(), refundReason: status.refundReason }; saveOperation(op);
  if (status.status === 'SUCCESS') { route.status = 'success'; saveOperation(op); return true; }
  if (['FAILED','REFUNDED','INCOMPLETE_DEPOSIT'].includes(status.status)) throw new Error(`Bitcoin route is ${status.status}. Inspect operations show ${op.id} and verify any refund before a new operation. Do not send a second deposit.`);
  op.fundingWindowExpired = Date.now() >= new Date(route.summary.deadline).getTime();
  op.stage = op.fundingWindowExpired ? 'funding-window-expired' : 'awaiting-external-funding'; saveOperation(op); return false;
}
export async function createDeposit(opts) {
  const p = validateCreate(opts), route = sourceRoute(opts), caps = limits(opts, route);
  const plan = requestedPlan(p, route), wallet = fundingWallet(route, { required: !!opts.yes });
  if (!wallet) return { mode: 'preview', ...plan, next: 'Configure your source wallet to obtain live balances, recipient validation and route fees. Run payhumans wallet --help.' };
  const c = sdkClient(wallet.account), base = evmClients(8453, wallet.account), cash = await fundingCash(caps.slippageBps);
  const [balances, source] = await Promise.all([baseBalances(wallet.account), sourceBalances(wallet)]);
  const bridgeAmount = p.amount > balances.usdc ? p.amount - balances.usdc : 0n;
  const direct = route.chainId === 8453 && route.asset === 'USDC';
  const preview = { mode: opts.yes ? 'execute' : 'preview', ...plan, owner: wallet.account.address, sourceWallet: route.chain === 'bitcoin' ? 'external Bitcoin wallet' : wallet.address, sourceBalance: displayBalances(source, route), baseUsdcBalance: formatUnits(balances.usdc, 6), baseEthBalance: formatUnits(balances.gas, 18), caps: { maxSourceSpend: caps.sourceSpend === null ? null : formatUnits(caps.sourceSpend, route.decimals), maxSourceGas: route.chain === 'bitcoin' ? null : formatUnits(caps.sourceGas, route.chain === 'solana' ? 9 : 18), maxBaseGas: formatUnits(caps.baseGas, 18), maxRouteFeeUsd: formatUnits(caps.routeFeeUsd, 6), slippageBps: caps.slippageBps }, openToAllClaimants: !opts.requireStake };
  if (!opts.yes) {
    const recipient = await validateRecipient(p.platform, p.recipient);
    const routes = {};
    if (bridgeAmount > 0n && !direct) routes.funding = route.chain === 'bitcoin' ? await bitcoinRoute(wallet, cash, bridgeAmount, opts, caps, true) : await newRelayRoute(wallet, cash, bridgeAmount);
    if (balances.gas < MIN_BASE_GAS && route.chainId !== 8453 && route.chain !== 'bitcoin') routes.gas = await newRelayRoute(wallet, cash, GAS_TOPUP, true);
    enforceRoutes({ routes }, null, caps);
    if (direct && caps.sourceSpend !== null && p.amount > caps.sourceSpend) throw new InvalidArgumentError('Deposit exceeds --max-source-spend.');
    return { ...preview, recipientValidation: recipient, routes: Object.fromEntries(Object.entries(routes).map(([k,v]) => [k,v.summary])), totalSourceInput: formatUnits(direct ? p.amount : Object.values(routes).reduce((s,r) => s + BigInt(r.input),0n), route.decimals), next: 'Review recipient identity, fiat rate, caps and fees. Repeat with --operation-id <unique-payment-id> --yes. Use that same ID for all retries.', gasRequirement: route.chain === 'bitcoin' ? 'External BTC flow requires at least 0.00002 ETH on Base before requesting a deposit address.' : null };
  }
  return withWalletLock(wallet.account.address, async () => {
    const op = openOperation(opts.operationId, 'create', publicOptions(opts, route), wallet.account.address);
    if (op.stage === 'complete') return { ...op.result, resumed: true };
    // Registration may update the Curator, but always precedes spending crypto.
    if (!op.prepared) {
      await validateRecipient(p.platform, p.recipient);
      const prepared = await c.prepareCreateDeposit(depositParams(p));
      if (prepared.prepared.to.toLowerCase() !== escrowAddress(c).toLowerCase() || BigInt(prepared.prepared.value ?? 0) !== 0n) throw new Error('Unexpected deposit contract or native value.');
      op.prepared = { to: prepared.prepared.to, data: prepared.prepared.data, value: '0' }; op.stage = 'recipient-ready'; saveOperation(op);
    }
    if (!op.transactions.deposit) {
      if (balances.gas < MIN_BASE_GAS && (route.chainId === 8453 || route.chain === 'bitcoin')) throw new Error('Keep at least 0.00002 ETH on Base for contract gas. No source funds were sent.');
      if (direct && (balances.usdc < p.amount || p.amount > caps.sourceSpend)) throw new Error('Base USDC balance or --max-source-spend is below the deposit amount.');
      if (!direct && bridgeAmount > 0n && !op.routes.funding) {
        const quoted = route.chain === 'bitcoin' ? await bitcoinRoute(wallet, cash, bridgeAmount, opts, caps, false) : await newRelayRoute(wallet, cash, bridgeAmount);
        enforceRoutes(op, quoted, caps); op.routes.funding = quoted; saveOperation(op);
      }
      if (balances.gas < MIN_BASE_GAS && !op.routes.gas) {
        const quoted = await newRelayRoute(wallet, cash, GAS_TOPUP, true);
        enforceRoutes(op, quoted, caps); op.routes.gas = quoted; saveOperation(op);
      }
      enforceRoutes(op, null, caps);
      // Include native gas headroom when the route input itself is ETH/SOL.
      const pendingRoutes = Object.entries(op.routes).filter(([label,r]) => r.status !== 'success' && !Object.keys(op.transactions).some(key => key.startsWith(`${label}:`)));
      const pendingInput = pendingRoutes.reduce((s,[,r]) => s + BigInt(r.input),0n);
      const quotedGas = pendingRoutes.reduce((s,[,r]) => s + BigInt(r.quote?.fees?.gas?.amount ?? 0), 0n);
      if (route.chain !== 'bitcoin' && pendingInput > 0n && (source.amount < pendingInput + (route.asset === 'USDC' ? 0n : quotedGas) || source.native < quotedGas)) throw new Error('Source wallet cannot cover route inputs plus the quoted network fees.');
      if (op.routes.gas) { op.stage = 'funding-gas'; saveOperation(op); await executeRelayRoute(op, 'gas', wallet, cash, caps); }
      if (op.routes.funding) {
        op.stage = 'funding'; saveOperation(op);
        if (route.chain === 'bitcoin') {
          if (!await reconcileBitcoin(op, cash)) return { operationId: op.id, stage: op.stage, ...preview, externalFunding: op.routes.funding.summary, next: op.fundingWindowExpired ? `Funding window expired: do not send BTC. If already sent, resume ${op.id} to monitor its original route/refund; do not create or fund a replacement.` : `After sending once, run payhumans operations resume ${op.id} --yes. Never start a second operation for this payment.` };
        } else await executeRelayRoute(op, 'funding', wallet, cash, caps);
      }
      const now = await baseBalances(wallet.account);
      if (now.usdc < p.amount) throw new Error(`Base balance has not reached ${formatUnits(p.amount,6)} USDC. Resume this operation after the confirmed route arrives; do not create a new ID.`);
      const allowance = await c.publicClient.readContract({ address: ESCROW_USDC, abi: erc20Abi, functionName: 'allowance', args: [wallet.account.address, escrowAddress(c)] });
      if (allowance < p.amount) await evmTransaction(op, 'approval', base, wallet.account, { to: ESCROW_USDC, data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [escrowAddress(c), p.amount] }), value: 0n }, caps.baseGas);
    }
    const confirmed = await evmTransaction(op, 'deposit', base, wallet.account, { ...op.prepared, value: 0n }, caps.baseGas);
    const receipt = await c.publicClient.getTransactionReceipt({ hash: confirmed.transactionHash });
    const contract = getContracts(8453,'production');
    const event = parseEventLogs({ abi: contract.abis.escrowV2 ?? contract.abis.escrow, logs: receipt.logs, strict: false }).find(e => e.eventName === 'DepositReceived');
    if (event?.args.depositId === undefined) throw new Error('Confirmed deposit transaction has no DepositReceived event. Inspect operation; never resubmit a new deposit.');
    const id = event.args.depositId; op.depositId = id.toString(); op.stage = 'deposit-created'; saveOperation(op);
    if (!opts.requireStake) {
      const method = getPaymentMethodsCatalog(8453,'production')[p.platform].paymentMethodHash;
      if (await c.isDisputeProtectionEnabled(escrowAddress(c), id, method)) {
        const tx = await c.setDisputeProtectionEnabled.prepare({ escrow: escrowAddress(c), depositId: id, paymentMethod: method, enabled: false });
        await evmTransaction(op, 'open-claims', base, wallet.account, { ...tx, value: BigInt(tx.value ?? 0) }, caps.baseGas);
      }
    }
    op.stage = 'complete'; op.result = { operationId: op.id, depositId: id.toString(), compositeDepositId: `${escrowAddress(c).toLowerCase()}_${id}`, transactionHash: confirmed.transactionHash, platform: p.platform, recipient: p.recipient, amount: formatUnits(p.amount,6), routes: Object.fromEntries(Object.entries(op.routes).map(([k,r]) => [k, { provider: r.provider, requestId: r.requestId, status: r.status, ...r.summary }])), claimUrl: `https://payhumans.ai/earn?deposit=${id}`, humanWorkflow: `Peer mobile → P2P tab → ${p.currency} → ${p.platform}. Buy USDC and Snipe/rate alerts are alternatives; compatible platform, amount and payment details are required. Notification opt-in and filters apply.`, note: 'Deposit created. Fiat has not been paid or proven by this action.' }; saveOperation(op); return op.result;
  });
}
export function normalizedOrder(id, escrow, onchain, indexed, indexerError = null) {
  const compositeDepositId = `${escrow.toLowerCase()}_${id}`;
  const order = indexed ? deriveCashOrder(compositeDepositId, indexed.intents ?? [], {
    remainingAmount: BigInt(indexed.remainingDeposits ?? 0), outstandingAmount: BigInt(indexed.outstandingIntentAmount ?? 0), takenAmount: BigInt(indexed.totalAmountTaken ?? 0), withdrawnAmount: BigInt(indexed.totalWithdrawn ?? 0), status: indexed.status, updatedAt: Number(indexed.updatedAt), intentCount: indexed.totalIntents,
  }) : null;
  const reserved = onchain?.deposit.outstandingIntentAmount ?? order?.pendingAmount;
  const available = onchain?.availableLiquidity ?? (indexed ? BigInt(indexed.remainingDeposits ?? 0) : null);
  return { depositId: String(id), compositeDepositId, escrow, chainId: 8453, owner: onchain?.deposit.depositor ?? indexed?.depositor, available: available === null ? null : formatUnits(available,6), reserved: reserved === undefined ? null : formatUnits(reserved,6), funded: order ? formatUnits(order.totalAmount,6) : null, fulfilled: order ? formatUnits(order.filledAmount,6) : null, withdrawn: order ? formatUnits(order.returnedAmount,6) : null, state: order?.state ?? 'indexer-unavailable', intents: order?.fills ?? [], indexed: !!order, indexerError, liquiditySource: onchain ? 'chain' : 'indexer', onchain,
    intentAmountUnits: { asset: 'USDC', decimals: 6, encoding: 'integer-base-units', fields: ['amount', 'releasedAmount', 'takerAmountNetFees'] },
    note: 'Historical totals and fill details use the indexer and may lag. SIGNALED is a claim, not a payment. FULFILLED indicates contract release; inspect fiatPaid/paymentId for verified payment evidence. No claim is automatically cancelled by this CLI.' };
}

export async function depositDisputeSettings(client, id, escrow, onchain, indexed) {
  const methods = [...new Set((onchain?.paymentMethods ?? indexed?.paymentMethods ?? []).map(m => m.paymentMethod ?? m.paymentMethodHash).filter(Boolean))];
  const catalog = Object.entries(getPaymentMethodsCatalog(8453, 'production'));
  const empty = onchain?.availableLiquidity === 0n && onchain?.deposit?.outstandingIntentAmount === 0n;
  const closed = !onchain || empty || ['CLOSED', 'WITHDRAWN', 'PRUNED'].includes(indexed?.status);
  return Promise.all(methods.map(async paymentMethodHash => {
    const platform = catalog.find(([, p]) => p.paymentMethodHash.toLowerCase() === paymentMethodHash.toLowerCase())?.[0] ?? null;
    const unknown = { platform, paymentMethodHash, enabled: null, requiresStake: null, riskWindowSeconds: null, source: 'unknown' };
    if (closed) return { ...unknown, note: 'No live policy setting is reported for a closed, empty or unavailable deposit.' };
    try {
      const [enabled, riskWindow] = await Promise.all([
        client.isDisputeProtectionEnabled(escrow, BigInt(id), paymentMethodHash),
        client.getRiskWindow(paymentMethodHash),
      ]);
      if (typeof enabled !== 'boolean') throw new Error('Dispute policy returned an invalid enabled setting.');
      return { platform, paymentMethodHash, enabled, requiresStake: enabled && riskWindow > 0n, riskWindowSeconds: riskWindow.toString(), source: 'chain' };
    } catch (error) { return { ...unknown, error: errorOutput(error).error }; }
  }));
}

export async function orderStatus(id) {
  const c = sdkClient(), escrow = escrowAddress(c), compositeId = `${escrow.toLowerCase()}_${id}`;
  const [chainResult,indexerResult] = await Promise.allSettled([c.getDeposit(BigInt(id)), c.indexer.getDepositsByIdsWithRelations([compositeId], { includeIntents:true })]);
  const onchain = chainResult.status === 'fulfilled' ? chainResult.value : null;
  const indexed = indexerResult.status === 'fulfilled' ? indexerResult.value[0] : null;
  if (!onchain && !indexed) throw chainResult.reason ?? new Error('Deposit not found.');
  if (!onchain && !/Deposit not found/.test(chainResult.reason?.message ?? '')) throw chainResult.reason;
  const indexerError = indexerResult.status === 'rejected' ? indexerResult.reason.message : indexed ? null : 'Deposit is not indexed yet.';
  return { ...normalizedOrder(id,escrow,onchain,indexed,indexerError), disputeProtection: await depositDisputeSettings(c,id,escrow,onchain,indexed) };
}

// ProtocolViewer owner enumeration can omit V2 deposits even when individual
// reads succeed. Query current-escrow history directly, including closed orders.
export async function listDeposits(owner, { client = sdkClient(), pageSize = 100 } = {}) {
  if (!isAddress(owner)) throw new InvalidArgumentError('Invalid deposit owner address.');
  const escrow = escrowAddress(client), orders = new Map();
  for (let offset = 0; ; offset += pageSize) {
    const page = await client.indexer.getDepositsWithRelations(
      { depositor: owner, chainId: 8453, escrowAddress: escrow },
      { limit: pageSize, offset, orderBy: 'timestamp', orderDirection: 'asc' },
      { includeIntents: true },
    );
    const previousSize = orders.size;
    for (const indexed of page) {
      if (indexed.depositor?.toLowerCase() !== owner.toLowerCase() || indexed.escrowAddress?.toLowerCase() !== escrow.toLowerCase() || Number(indexed.chainId) !== 8453 || !/^\d+$/.test(indexed.depositId)) {
        throw new Error('Indexer owner history returned a deposit outside the requested owner or current Base escrow.');
      }
      const order = normalizedOrder(indexed.depositId, escrow, null, indexed);
      orders.set(order.compositeDepositId, order);
    }
    if (page.length < pageSize) return [...orders.values()];
    if (orders.size === previousSize) throw new Error('Indexer owner history pagination did not advance. Retry the read.');
  }
}
