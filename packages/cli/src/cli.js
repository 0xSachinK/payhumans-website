#!/usr/bin/env node
import { Command } from 'commander';
import { setLogLevel, getPaymentMethodsCatalog } from '@zkp2p/sdk';
import { erc20Abi, formatUnits } from 'viem';
import { readFileSync } from 'node:fs';
import { decimal, platforms, depositId, json, errorOutput, recipientRegistrationUrl, InvalidArgumentError, GAS_PREVIEW_NOTE } from './core.js';
import { ROUTES, sourceRoute, fundingWallet, sourceBalances, displayBalances, fundingCash, evmClients, limits } from './funding.js';
import { createDeposit, sdkClient, baseBalances, escrowAddress, orderStatus, listDeposits, validateRecipient, recipientDetails } from './deposits.js';
import { readOperation, listOperations, openOperation, saveOperation, withWalletLock } from './operations.js';
import { evmTransaction, executeRelayRoute } from './transactions.js';
import { relayClient, quoteSummary, ESCROW_USDC, SOLANA_CHAIN_ID, SOLANA_USDC } from './solana.js';
setLogLevel('error');
const output = value => process.stdout.write(`${json(value)}\n`);
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
const program = new Command().name('payhumans').description('Agent-owned crypto funding for human-executed fiat payments. Writes preview unless --yes is supplied.').version(version);
program.configureOutput({ writeErr: str => process.stderr.write(`${json({ error: { code: 'INVALID_ARGUMENT', message: str.trim() } })}\n`) });
program.exitOverride();
function sourceOptions(command) { return command.option('--source-chain <chain>', 'ethereum, base, arbitrum, optimism, polygon, solana or bitcoin', 'solana').option('--source-asset <asset>', 'ETH, SOL, USDC or BTC (chain-dependent)', 'USDC'); }
function writeOptions(command) { return command.option('--operation-id <id>', 'Unique ID for this payment/action; REQUIRED with --yes, reuse on retries').option('--max-base-gas <eth>', 'Aggregate Base execution-gas upper bound', '0.0001').option('--yes', 'Execute the reviewed action'); }
function fundingOptions(command) { return command.option('--max-source-spend <amount>', 'Maximum source asset input including route fees; REQUIRED with --yes').option('--max-spend <usdc>', 'USDC deposit cap; also source spend alias for USDC sources').option('--max-source-gas <native>', 'Aggregate source execution-gas cap (default 0.002 SOL or 0.001 native EVM)').option('--max-route-fee-usd <usd>', 'Maximum route service fees in USD', '2').option('--slippage-bps <bps>', 'Route slippage tolerance, integer 0–100', '50'); }
program.command('platforms').description('Discover production payment catalog and recipient requirements').action(() => output({ settlement: 'Base USDC', platforms: platforms() }));
program.command('routes').description('Discover CLI-supported source assets (live quote still required)').option('--live', 'Check currently advertised provider sources').action(async opts => {
  const result = { settlement: { chain: 'base', chainId: 8453, asset: 'USDC', address: ESCROW_USDC }, routes: ROUTES, note: 'Supported implementation is not evidence of funded testing. Availability, minimum amount and fees are checked by a fresh provider quote. BTC uses an external wallet and needs Base ETH for escrow gas. Wrapped BTC is not native BTC.' };
  if (opts.live) { const cash = await fundingCash(); const [relay,near] = await Promise.all([cash.sourceCapabilities(),cash.nearIntentsCapabilities()]); result.providerSources = { relay, nearIntentsBitcoin: near.assets.filter(a => a.blockchain === 'btc' && ['nep141:btc.omft.near','1cs_v1:btc:native:coin'].includes(a.assetId)) }; }
  output(result);
});
sourceOptions(program.command('wallet').alias('balances').description('Show source balance and the Base deposit-owning wallet')).action(async opts => {
  const route = sourceRoute(opts), wallet = fundingWallet(route);
  const [source, base] = await Promise.all([sourceBalances(wallet),baseBalances(wallet.account)]);
  output({ source: { chain: route.chain, address: route.chain === 'bitcoin' ? 'external Bitcoin wallet' : wallet.address, ...displayBalances(source,route) }, escrowAccount: { address: wallet.account.address, chainId: 8453, usdc: formatUnits(base.usdc,6), eth: formatUnits(base.gas,18), keyOwnership: wallet.keypair ? 'Deterministically derived from the Solana key; keep that same key to recover deposits.' : 'Your EVM wallet owns deposits directly.' } });
});
const recipient = program.command('recipient').description('Validate, register and retrieve platform payment recipients');
recipient.command('validate').requiredOption('--platform <name>').requiredOption('--recipient <id>').action(async opts => output(await validateRecipient(opts.platform.toLowerCase(),opts.recipient)));
recipient.command('show').requiredOption('--platform <name>').requiredOption('--hash <bytes32>').action(async opts => output(await recipientDetails(opts.platform.toLowerCase(),opts.hash)));
recipient.command('register').requiredOption('--platform <name>').requiredOption('--recipient <id>').option('--yes', 'Register recipient data with Peer (no crypto transaction)').action(async opts => {
  const checked = await validateRecipient(opts.platform.toLowerCase(), opts.recipient);
  if (!opts.yes) return output({ mode: 'preview', ...checked, registrationUrl: recipientRegistrationUrl(opts.platform), next: `Repeat with --yes to register. Verified platforms may first require the recipient to complete identity verification at ${recipientRegistrationUrl(opts.platform)}.` });
  output(await sdkClient().registerPayeeDetails({ processorNames: [opts.platform.toLowerCase()], payeeData: [{ offchainId: opts.recipient }] }));
});
const operations = program.command('operations').description('Inspect and resume durable local operation journals');
operations.command('list').action(() => output(listOperations().map(op => ({ operationId: op.id, kind: op.kind, stage: op.stage, owner: op.owner, depositId: op.depositId, updatedAt: op.updatedAt }))));
operations.command('show').argument('<id>').action(id => output(readOperation(id)));
operations.command('resume').argument('<id>').option('--yes', 'Resume signing only the saved operation and original limits').action(async (id, opts) => {
  const op = readOperation(id);
  if (!opts.yes) return output({ mode: 'preview', operationId:id, kind:op.kind, stage:op.stage, request:op.request, gasWarning:GAS_PREVIEW_NOTE, next: `payhumans operations resume ${id} --yes` });
  const params = { ...op.request, operationId:id, yes:true };
  if (op.kind === 'create') output(await createDeposit(params));
  else if (op.kind === 'withdraw') output(await withdraw(params));
  else if (op.kind === 'return') output(await returnFunds(params));
  else if (op.kind === 'open-claims') output(await openClaims(params));
  else throw new Error('Unknown operation kind.');
});
const deposits = program.command('deposit').description('Create requests, inspect partial fills, recover available funds');
fundingOptions(writeOptions(sourceOptions(deposits.command('create').description('Preview funding and recipient; --yes registers, funds and creates once'))))
  .requiredOption('--platform <name>').requiredOption('--recipient <id>').requiredOption('--amount <usdc>').requiredOption('--currency <code>').requiredOption('--rate <fiat-per-usdc>')
  .option('--min <usdc>', 'Minimum partial claim, default min(1USDC,amount)').option('--max <usdc>', 'Maximum claim, default full amount').option('--require-stake', 'Keep dispute protection enabled; claimants need stake').option('--refund-address <btc-address>', 'Your mainnet BTC refund address; required for Bitcoin funding')
  .action(async opts => output(await createDeposit(opts)));
deposits.command('show').argument('<id>').description('Read chain liquidity plus indexed fills, verified receipts and historical totals').action(async id => output(await orderStatus(depositId(id))));
sourceOptions(deposits.command('list').description('List indexed current-escrow owner history, including closed orders; use show for live liquidity')).option('--owner <address>', 'Deposit owner on Base; no signing key needed when supplied').action(async opts => {
  const owner = opts.owner ?? fundingWallet(sourceRoute(opts), { required: false })?.account.address;
  if (!owner) throw new InvalidArgumentError('No wallet configured for deposit list. The default --source-chain is solana. Pass --owner <Base EVM address> for a keyless read, or explicitly choose --source-chain and configure that wallet key. For Solana, set PAYHUMANS_SOLANA_KEY_FILE.');
  output(await listDeposits(owner));
});
async function withdraw(opts) {
  let previous;
  if (opts.yes && opts.operationId) { try { previous = readOperation(opts.operationId); } catch(e) { if(e.code !== "OPERATION_NOT_FOUND") throw e; } }
  if(previous?.stage === "complete") return previous.result;
  const id = depositId(opts.id), c = sdkClient();
  const d = previous?.transactions?.withdraw ? { deposit: { depositor: previous.owner }, availableLiquidity: BigInt(previous.amount) } : await c.getDeposit(id);
  const available = d.availableLiquidity;
  const amount = previous?.amount ? BigInt(previous.amount) : opts.amount ? decimal(opts.amount,'amount') : available;
  if (!previous?.transactions?.withdraw && (amount <= 0n || amount > available)) throw new Error(`Only ${formatUnits(available,6)} USDC is available. Reserved claims cannot be withdrawn.`);
  const preview = { depositId: id.toString(), amount: formatUnits(amount,6), available: formatUnits(available,6), to: d.deposit.depositor, asset: 'Base USDC', note: 'Withdraws available liquidity only. Does not cancel active human claims. Funds stay in your own Base wallet; use return to move to Solana.' };
  if (!opts.yes) return { mode:'preview', ...preview, gasWarning:GAS_PREVIEW_NOTE };
  const route = sourceRoute(opts), wallet = fundingWallet(route), base = evmClients(8453,wallet.account), signed = sdkClient(wallet.account);
  if (d.deposit.depositor.toLowerCase() !== wallet.account.address.toLowerCase()) throw new Error('Your wallet does not own this deposit.');
  return withWalletLock(wallet.account.address,async () => {
    const { yes, operationId, ...request } = opts;
    const op = openOperation(operationId,'withdraw',request,wallet.account.address);
    if (op.stage === 'complete') return op.result;
    if (!op.prepared) { const tx = await signed.removeFunds.prepare({ depositId:id, amount }); op.prepared = { ...tx, value: String(tx.value ?? 0) }; op.amount = amount.toString(); saveOperation(op); }
    const result = await evmTransaction(op,'withdraw',base,wallet.account,{ ...op.prepared,value:BigInt(op.prepared.value) },decimal(opts.maxBaseGas ?? '0.0001','max-base-gas',18));
    op.stage='complete'; op.result={ operationId, ...preview, amount:formatUnits(BigInt(op.amount),6), ...result }; saveOperation(op); return op.result;
  });
}
writeOptions(sourceOptions(deposits.command('withdraw').description('Withdraw available USDC to the deposit owner on Base; never cancel active claims'))).requiredOption('--id <id>').option('--amount <usdc>', 'Amount, default all available').option('--keep-in-escrow-account', 'Compatibility alias; withdrawals always remain in your Base wallet').action(async opts => output(await withdraw(opts)));
async function openClaims(opts) {
  const id = depositId(opts.id), method = getPaymentMethodsCatalog(8453,'production')[opts.platform.toLowerCase()]?.paymentMethodHash;
  if (!method) throw new InvalidArgumentError('Unsupported platform.');
  if (!opts.yes) return { mode:'preview',depositId:id,platform:opts.platform,gasWarning:GAS_PREVIEW_NOTE,note:'Disable dispute protection for this payment method. Human claimants need no stake; the depositor accepts payment reversal risk.' };
  const wallet=fundingWallet(sourceRoute(opts)), c=sdkClient(wallet.account), base=evmClients(8453,wallet.account);
  if ((await c.getDeposit(id)).deposit.depositor.toLowerCase()!==wallet.account.address.toLowerCase()) throw new Error('Your wallet does not own this deposit.');
  return withWalletLock(wallet.account.address,async()=>{
    const { yes,operationId,...request }=opts, op=openOperation(operationId,'open-claims',request,wallet.account.address);
    if(op.stage==='complete') return op.result;
    if(await c.isDisputeProtectionEnabled(escrowAddress(c),id,method)) {
      const tx=await c.setDisputeProtectionEnabled.prepare({escrow:escrowAddress(c),depositId:id,paymentMethod:method,enabled:false});
      await evmTransaction(op,'open-claims',base,wallet.account,tx,decimal(opts.maxBaseGas,'max-base-gas',18));
    }
    op.stage='complete';op.result={operationId,depositId:id.toString(),disputeProtection:'disabled'};saveOperation(op);return op.result;
  });
}
writeOptions(sourceOptions(deposits.command('open-claims'))).requiredOption('--id <id>').requiredOption('--platform <name>').action(async opts=>output(await openClaims(opts)));
async function returnFunds(opts) {
  let previous;
  if(opts.yes && opts.operationId){try{previous=readOperation(opts.operationId);}catch(e){if(e.code!=="OPERATION_NOT_FOUND")throw e;}}
  if(previous?.stage==="complete")return previous.result;
  const original=fundingWallet(sourceRoute(opts));
  if(!original.keypair) throw new Error('return currently supports Solana USDC destination. EVM withdrawals remain in your EVM wallet on Base; Bitcoin refund only applies to failed provider funding.');
  const balance=(await baseBalances(original.account)).usdc, amount=previous?.routes?.return ? BigInt(previous.routes.return.input) : opts.amount?decimal(opts.amount,'amount'):balance;
  if(!previous?.routes?.return && (amount<=0n || amount>balance)) throw new Error(`Base wallet holds ${formatUnits(balance,6)} USDC.`);
  const slippageBps=Number(opts.slippageBps ?? 50);
  if(!Number.isInteger(slippageBps)||slippageBps<0||slippageBps>100)throw new InvalidArgumentError('--slippage-bps must be an integer between 0 and 100.');
  const cash=await fundingCash(slippageBps), client=await relayClient();
  const quote=previous?.routes?.return?.quote ?? await client.actions.getQuote({chainId:8453,currency:ESCROW_USDC,toChainId:SOLANA_CHAIN_ID,toCurrency:SOLANA_USDC,user:original.account.address,recipient:original.address,amount:amount.toString(),tradeType:'EXACT_INPUT'},false);
  const d=quote.details;
  if(Number(d.currencyIn.currency.chainId)!==8453 || d.currencyIn.currency.address.toLowerCase()!==ESCROW_USDC.toLowerCase() || BigInt(d.currencyIn.amount)!==amount || Number(d.currencyOut.currency.chainId)!==SOLANA_CHAIN_ID || d.currencyOut.currency.address!==SOLANA_USDC || d.recipient!==original.address || d.sender.toLowerCase()!==original.account.address.toLowerCase()) throw new Error('Return quote identity mismatch.');
  const min=BigInt(d.currencyOut.minimumAmount??d.currencyOut.amount), summary=quoteSummary(quote);
  if(opts.minReceive && min<decimal(opts.minReceive,'min-receive')) throw new Error('Return minimum output is below --min-receive.');
  if(!opts.yes)return{mode:'preview',amount:formatUnits(amount,6),minimumReceive:formatUnits(min,6),to:original.address,quote:summary,gasWarning:GAS_PREVIEW_NOTE,next:'Repeat with --min-receive, --operation-id and --yes.'};
  if(!opts.minReceive)throw new InvalidArgumentError('--min-receive is required with --yes to bound return fees/slippage.');
  return withWalletLock(original.account.address,async()=>{
    const {yes,operationId,...request}=opts,op=openOperation(operationId,'return',request,original.account.address);
    if(op.stage==='complete')return op.result;
    if(!op.routes.return){op.routes.return={provider:'relay',input:amount.toString(),requestId:summary.requestId,quote,status:'quoted',summary};saveOperation(op);}
    const base=evmClients(8453,original.account),wallet={...base,route:sourceRoute({sourceChain:'base',sourceAsset:'USDC'}),address:original.account.address,account:original.account};
    await executeRelayRoute(op,'return',wallet,cash,{baseGas:decimal(opts.maxBaseGas,'max-base-gas',18)});
    op.stage='complete';op.result={operationId,amount:formatUnits(BigInt(op.routes.return.input),6),route:op.routes.return.summary,status:op.routes.return.status};saveOperation(op);return op.result;
  });
}
writeOptions(sourceOptions(program.command('return').description('Route Base USDC back to the same Solana wallet'))).option('--amount <usdc>').option('--min-receive <usdc>', 'Minimum Solana USDC out, REQUIRED with --yes').option('--slippage-bps <bps>','0–100','50').action(async opts=>output(await returnFunds(opts)));
program.parseAsync().catch(error=>{
  if(error.code==='commander.helpDisplayed'||error.code==='commander.version')return;
  if(!String(error.code??'').startsWith('commander.'))process.stderr.write(`${json(errorOutput(error))}\n`);
  process.exitCode=1;
});
