import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { base58, bech32, bech32m } from '@scure/base';
import { createPublicClient, createWalletClient, erc20Abi, formatUnits, http, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { createCashClient } from '@zkp2p/cash';
import { escrowAccount, loadSolanaKeypair, relayClient, solanaConnection, solanaBalances, SOLANA_CHAIN_ID, SOLANA_USDC, ESCROW_USDC } from './solana.js';
import { decimal, InvalidArgumentError } from './core.js';

export const NATIVE = '0x0000000000000000000000000000000000000000';
const EVM_CHAINS = [mainnet, base, arbitrum, optimism, polygon];
const USDC = { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 8453: ESCROW_USDC, 42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' };
export const ROUTES = [
  ...EVM_CHAINS.flatMap(chain => ['USDC', ...(chain.id === 137 ? [] : ['ETH'])].map(symbol => ({ chain: chain.id === 1 ? 'ethereum' : chain.name.toLowerCase().replace('arbitrum one', 'arbitrum').replace('op mainnet', 'optimism'), chainId: chain.id, asset: symbol, address: symbol === 'USDC' ? USDC[chain.id] : NATIVE, decimals: symbol === 'USDC' ? 6 : 18, mode: 'agent-signed', provider: chain.id === 8453 && symbol === 'USDC' ? 'direct' : 'relay' }))),
  ...['SOL', 'USDC'].map(symbol => ({ chain: 'solana', chainId: SOLANA_CHAIN_ID, asset: symbol, address: symbol === 'SOL' ? '11111111111111111111111111111111' : SOLANA_USDC, decimals: symbol === 'SOL' ? 9 : 6, mode: 'agent-signed', provider: 'relay' })),
  { chain: 'bitcoin', chainId: 'bitcoin', asset: 'BTC', decimals: 8, mode: 'external-wallet', provider: 'near-intents' },
];
export function sourceRoute(opts = {}) {
  const name = String(opts.sourceChain ?? 'solana').toLowerCase();
  const symbol = String(opts.sourceAsset ?? (name === 'bitcoin' ? 'BTC' : 'USDC')).toUpperCase();
  const route = ROUTES.find(r => (r.chain === name || String(r.chainId) === name) && r.asset === symbol);
  if (!route) throw new InvalidArgumentError(`Unsupported source ${name}/${symbol}. Run payhumans routes. Native BTC is distinct from wrapped BTC.`);
  return route;
}
export function evmKey({ required = true } = {}) {
  let key = process.env.PAYHUMANS_EVM_KEY || process.env.PAYHUMANS_PRIVATE_KEY;
  const file = process.env.PAYHUMANS_EVM_KEY_FILE || process.env.PAYHUMANS_PRIVATE_KEY_FILE;
  if (!key && file) key = fs.readFileSync(file, 'utf8').trim();
  if (!key) { if (!required) return null; throw new Error('Set PAYHUMANS_EVM_KEY or PAYHUMANS_PRIVATE_KEY_FILE through a secret manager. No Privy account is required.'); }
  if (key.startsWith('{')) { try { const parsed = JSON.parse(key); key = parsed.privateKey ?? parsed.private_key ?? parsed.key; } catch { throw new Error('EVM key file contains invalid JSON. Expected a privateKey field.'); } }
  if (typeof key !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(key)) throw new Error('EVM signing key must be a 0x-prefixed private key, optionally a JSON record with a privateKey field.');
  return privateKeyToAccount(key);
}
export function evmClients(chainId, account) {
  const chain = EVM_CHAINS.find(c => c.id === chainId);
  if (!chain) throw new Error('Unsupported EVM chain.');
  const rpcUrl = process.env[`PAYHUMANS_RPC_${chainId}`] || (chainId === 8453 ? process.env.PAYHUMANS_ESCROW_RPC_URL : process.env.PAYHUMANS_EVM_RPC_URL) || chain.rpcUrls.default.http[0];
  const transport = http(rpcUrl, { timeout: 20_000, retryCount: 2 });
  return { chain, rpcUrl, publicClient: createPublicClient({ chain, transport }), walletClient: createWalletClient({ chain, transport, account }) };
}
export function fundingWallet(route, { required = true } = {}) {
  if (route.chain === 'solana') {
    const keypair = loadSolanaKeypair({ required }); if (!keypair) return null;
    return { route, address: keypair.publicKey.toBase58(), account: escrowAccount(keypair), keypair, connection: solanaConnection() };
  }
  const account = evmKey({ required }); if (!account) return null;
  return { route, address: account.address, account, ...(route.chain !== 'bitcoin' ? evmClients(route.chainId, account) : {}) };
}
export async function sourceBalances(wallet) {
  if (wallet.route.chain === 'bitcoin') return { asset: 'BTC', balance: null, note: 'Read BTC balance with your external Bitcoin wallet; this CLI never holds a Bitcoin key.' };
  if (wallet.keypair) {
    if (await wallet.connection.getGenesisHash() !== '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d') throw new Error('Solana RPC is not mainnet-beta. No funds were signed.');
    const balances = await solanaBalances(wallet.connection, wallet.keypair.publicKey);
    return { amount: wallet.route.asset === 'SOL' ? balances.lamports : balances.usdc, native: balances.lamports, asset: wallet.route.asset, nativeSymbol: 'SOL', nativeDecimals: 9 };
  }
  if (await wallet.publicClient.getChainId() !== wallet.route.chainId) throw new Error('Source RPC chain does not match --source-chain.');
  const native = await wallet.publicClient.getBalance({ address: wallet.address });
  const amount = wallet.route.asset === 'ETH' ? native : await wallet.publicClient.readContract({ address: wallet.route.address, abi: erc20Abi, functionName: 'balanceOf', args: [wallet.address] });
  return { amount, native, asset: wallet.route.asset, nativeSymbol: wallet.chain.nativeCurrency.symbol, nativeDecimals: 18 };
}
export async function fundingCash(slippageBps = 50) {
  const relay = await relayClient();
  // Cash's quoteSource delegates through this client. Supply a bounded slippage policy to every quote.
  if (!relay.payhumansOriginalGetQuote) relay.payhumansOriginalGetQuote = relay.actions.getQuote;
  relay.actions = { ...relay.actions, getQuote: (params, ...rest) => relay.payhumansOriginalGetQuote({ ...params, options: { ...params.options, slippageTolerance: String(slippageBps) } }, ...rest) };
  return createCashClient({ environment: 'production', relay: { client: relay }, nearIntents: { fetch: async (...args) => { const response = await fetch(...args); if(!response.ok) { const body = await response.clone().json().catch(()=>null); if(typeof body?.message === 'string') throw new Error(`NEAR Intents HTTP ${response.status}: ${body.message.slice(0,300)}`); } return response; }, ...(process.env.PAYHUMANS_NEAR_INTENTS_TOKEN ? { token: process.env.PAYHUMANS_NEAR_INTENTS_TOKEN } : {}) } });
}
export function limits(opts, route) {
  const sourceSpend = opts.maxSourceSpend ?? (route.asset === 'USDC' ? opts.maxSpend : undefined);
  if (opts.yes && !sourceSpend) throw new InvalidArgumentError('--max-source-spend is required with --yes (in source-asset units, includes route input and route fees). For USDC, --max-spend is a compatible alias.');
  const slippageBps = Number(opts.slippageBps ?? 50);
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 100) throw new InvalidArgumentError('--slippage-bps must be an integer between 0 and 100.');
  return {
    sourceSpend: sourceSpend ? decimal(sourceSpend, 'max-source-spend', route.decimals) : null,
    sourceGas: decimal(opts.maxSourceGas ?? (route.chain === 'solana' ? '0.002' : '0.001'), 'max-source-gas', route.chain === 'solana' ? 9 : 18),
    baseGas: decimal(opts.maxBaseGas ?? '0.0001', 'max-base-gas', 18),
    routeFeeUsd: decimal(opts.maxRouteFeeUsd ?? '2', 'max-route-fee-usd', 6),
    slippageBps,
  };
}
export function assertQuote(raw, wallet, destination, desiredAmount) {
  const d = raw?.details;
  if (!d || !isAddress(destination.address) || String(d.currencyIn?.currency?.chainId) !== String(wallet.route.chainId) || d.currencyIn.currency.address.toLowerCase() !== wallet.route.address.toLowerCase() || d.sender !== wallet.address || d.recipient.toLowerCase() !== wallet.account.address.toLowerCase() || Number(d.currencyOut?.currency?.chainId) !== 8453 || d.currencyOut.currency.address.toLowerCase() !== destination.address.toLowerCase()) throw new Error('Route quote does not match the requested source, recipient or Base destination asset.');
  const output = BigInt(d.currencyOut.minimumAmount ?? d.currencyOut.amount);
  if (output < desiredAmount) throw new Error('Route minimum output does not fund the requested destination amount.');
  const input = BigInt(d.currencyIn.maximumAmount ?? d.currencyIn.amount);
  if (input <= 0n) throw new Error('Route input must be positive.');
  const requestId = raw.steps?.find(s => s.requestId)?.requestId;
  if (!requestId) throw new Error('Route quote has no recoverable request ID.');
  // Explicit-deposit quotes only: never silently authorize permits or other message signatures.
  if (raw.steps.some(s => s.kind !== 'transaction')) throw new Error('This route requires unsupported offchain signature steps. No funds were sent.');
  return { input, output, requestId };
}
export function assertSpendBudget(op, input, cap) {
  const total = Object.values(op?.routes ?? {}).reduce((s, r) => s + BigInt(r.input ?? 0), 0n) + input;
  if (cap !== null && total > cap) throw new Error(`Route source spend exceeds --max-source-spend (${total} base units > ${cap}).`);
  return total;
}
export function displayBalances(b, route) { return { ...b, amount: b.amount === undefined ? null : formatUnits(b.amount, route.decimals), native: b.native === undefined ? null : formatUnits(b.native, b.nativeDecimals) }; }

export function bitcoinAddress(address) {
  try {
    if (/^bc1/i.test(address)) {
      if (address !== address.toLowerCase() && address !== address.toUpperCase()) return false;
      const value = address.toLowerCase();
      for (const codec of [bech32, bech32m]) {
        try {
          const decoded = codec.decode(value, 90);
          const [version, ...words] = decoded.words;
          const program = codec.fromWords(words);
          if (decoded.prefix !== 'bc' || version > 16 || program.length < 2 || program.length > 40) return false;
          return version === 0 ? codec === bech32 && [20,32].includes(program.length) : codec === bech32m;
        } catch {}
      }
      return false;
    }
    const bytes = base58.decode(address);
    if (bytes.length !== 25 || ![0,5].includes(bytes[0])) return false;
    const digest = createHash('sha256').update(createHash('sha256').update(bytes.slice(0,21)).digest()).digest();
    return Buffer.from(bytes.slice(21)).equals(digest.subarray(0,4));
  } catch { return false; }
}
