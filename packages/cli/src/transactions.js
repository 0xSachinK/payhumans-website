import { VersionedTransaction } from '@solana/web3.js';
import { erc20Abi, decodeFunctionData, keccak256 } from 'viem';
import { saveOperation, fingerprint } from './operations.js';
import { relayClient, waitForRelay } from './solana.js';
import { NATIVE } from './funding.js';

function publicRequest(request) {
  return Object.fromEntries(['to','data','value','nonce','gas','gasPrice','maxFeePerGas','maxPriorityFeePerGas','chainId','type','accessList'].filter(k => request[k] !== undefined).map(k => [k, typeof request[k] === 'bigint' ? request[k].toString() : request[k]]));
}
function restoreRequest(request) {
  return Object.fromEntries(Object.entries(request).map(([k,v]) => [k, ['value','gas','gasPrice','maxFeePerGas','maxPriorityFeePerGas'].includes(k) ? BigInt(v) : v]));
}
export async function evmTransaction(op, label, clients, account, tx, maxGas) {
  let record = op.transactions[label];
  if (!record) {
    if (await clients.publicClient.getChainId() !== clients.chain.id) throw new Error('RPC chain ID mismatch; no transaction signed.');
    let latest, pending;
    for (let attempt = 0; attempt < 6; attempt++) {
      [latest, pending] = await Promise.all(['latest','pending'].map(blockTag => clients.publicClient.getTransactionCount({ address: account.address, blockTag })));
      if (latest === pending) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (latest !== pending) throw new Error('Wallet has pending transactions or an incoherent RPC nonce. Resume the earlier operation once confirmed; no transaction was signed.');
    const request = await clients.walletClient.prepareTransactionRequest({ account, ...tx, nonce: latest });
    request.chainId = clients.chain.id;
    const maximumFee = request.gas * (request.maxFeePerGas ?? request.gasPrice);
    const reservedGas = Object.values(op.transactions).filter(t => t.chainId === clients.chain.id && t.kind === 'evm').reduce((sum,t) => sum + BigInt(t.maximumFee), 0n);
    if (reservedGas + maximumFee > maxGas) throw new Error(`Network gas budget exceeded for chain ${clients.chain.id}. Increase its explicit gas cap only after review.`);
    const serialized = await account.signTransaction({ ...request, chainId: clients.chain.id });
    record = { kind: 'evm', chainId: clients.chain.id, address: account.address, transactionHash: keccak256(serialized), request: publicRequest(request), maximumFee: maximumFee.toString(), stage: 'signed' };
    op.transactions[label] = record;
    saveOperation(op); // Durable hash, nonce and PUBLIC transaction fields precede any broadcast.
  }
  if (record.chainId !== clients.chain.id || record.address.toLowerCase() !== account.address.toLowerCase()) throw new Error('Persisted transaction does not belong to this wallet/network.');
  if (record.receipt?.status === 'reverted') throw new Error(`Transaction reverted: ${record.transactionHash}. Operation cannot create a replacement payment.`);
  if (!record.receipt) {
    let mined;
    try { mined = await clients.publicClient.getTransactionReceipt({ hash: record.transactionHash }); } catch (e) { if (e.name !== 'TransactionReceiptNotFoundError') throw e; }
    if (!mined) {
      const serialized = await account.signTransaction(restoreRequest(record.request));
      if (keccak256(serialized) !== record.transactionHash) throw new Error('Recovered transaction hash differs; refusing to broadcast.');
      try { await clients.publicClient.sendRawTransaction({ serializedTransaction: serialized }); } catch (e) {
        // A same-hash rebroadcast is safe; a nonce consumed by any other tx requires manual reconciliation.
        if (!/already known|known transaction/i.test(e.shortMessage || e.message)) {
          try { await clients.publicClient.getTransaction({ hash: record.transactionHash }); } catch { throw e; }
        }
      }
      record.stage = 'broadcast'; saveOperation(op);
      mined = await clients.publicClient.waitForTransactionReceipt({ hash: record.transactionHash, timeout: 120_000 });
    }
    record.receipt = { status: mined.status, transactionHash: mined.transactionHash, blockNumber: mined.blockNumber.toString(), gasUsed: mined.gasUsed.toString() };
    record.stage = mined.status; saveOperation(op);
  }
  if (record.receipt.status !== 'success') throw new Error(`Transaction reverted: ${record.transactionHash}.`);
  return record.receipt;
}
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export function base58Encode(bytes) {
  let n = 0n; for (const byte of bytes) n = n * 256n + BigInt(byte);
  let result = ''; while (n) { result = B58[Number(n % 58n)] + result; n /= 58n; }
  for (const byte of bytes) { if (byte !== 0) break; result = '1' + result; }
  return result;
}
async function solanaTransaction(op, label, wallet, transaction, maxGas) {
  let record = op.transactions[label];
  if (!record) {
    const fee = (await wallet.connection.getFeeForMessage(transaction.message, 'confirmed')).value;
    if (fee === null) throw new Error('Solana quote blockhash expired. No transaction signed.');
    const reserved = Object.values(op.transactions).filter(t => t.kind === 'solana').reduce((s,t) => s + BigInt(t.maximumFee), 0n);
    if (reserved + BigInt(fee) > maxGas) throw new Error('Solana network fee exceeds --max-source-gas.');
    if (transaction.signatures.some(s => s.some(b => b !== 0))) throw new Error('Unexpected pre-signed Solana route transaction.');
    const unsignedTransaction = Buffer.from(transaction.serialize()).toString('base64');
    transaction.sign([wallet.keypair]);
    record = { kind: 'solana', chainId: wallet.route.chainId, address: wallet.address, transactionHash: base58Encode(transaction.signatures[0]), unsignedTransaction, maximumFee: String(fee), stage: 'signed' };
    op.transactions[label] = record; saveOperation(op);
  }
  const recovered = VersionedTransaction.deserialize(Buffer.from(record.unsignedTransaction, 'base64')); recovered.sign([wallet.keypair]);
  if (base58Encode(recovered.signatures[0]) !== record.transactionHash) throw new Error('Recovered Solana signature differs; refusing to send.');
  const status = (await wallet.connection.getSignatureStatuses([record.transactionHash], { searchTransactionHistory: true })).value[0];
  if (status?.err) throw new Error(`Solana transaction failed: ${record.transactionHash}. Reconcile the operation before a new request.`);
  if (!status) {
    const valid = await wallet.connection.isBlockhashValid(recovered.message.recentBlockhash, { commitment: 'confirmed' });
    if (!valid.value) throw new Error(`Solana transaction ${record.transactionHash} is unknown and its blockhash expired. Check Relay and Solscan; this operation will not automatically issue another funding transfer.`);
    await wallet.connection.sendRawTransaction(recovered.serialize(), { maxRetries: 5 });
  }
  record.stage = status?.confirmationStatus ?? 'broadcast'; saveOperation(op);
  return record.transactionHash;
}
export function routeTransactionLabel(routeLabel, tx, chainId) {
  return `${routeLabel}:${fingerprint({ chainId, to: tx.to.toLowerCase(), data: (tx.data ?? "0x").toLowerCase(), value: BigInt(tx.value ?? 0).toString() }).slice(0,24)}`;
}
function validateEvmRouteTx(tx, wallet, route) {
  if (Number(tx.chainId ?? wallet.route.chainId) !== wallet.route.chainId || (tx.from && tx.from.toLowerCase() !== wallet.address.toLowerCase())) throw new Error('Route transaction wallet or chain mismatch.');
  const value = BigInt(tx.value ?? 0);
  if (wallet.route.address === NATIVE && value > BigInt(route.input)) throw new Error('Route transaction exceeds approved source spend.');
  if (wallet.route.asset === 'USDC') {
    if (value !== 0n) throw new Error('USDC route unexpectedly sends native value.');
    if (tx.to.toLowerCase() === wallet.route.address.toLowerCase()) {
      const decoded = decodeFunctionData({ abi: erc20Abi, data: tx.data });
      if (!['approve','transfer'].includes(decoded.functionName) || BigInt(decoded.args[1]) > BigInt(route.input)) throw new Error('Route token approval/transfer exceeds exact approved source spend.');
    }
  }
}
export async function executeRelayRoute(op, label, wallet, cash, caps) {
  const route = op.routes[label];
  if (route.status === 'success') return route;
  // Reconcile the persisted route before any signing. A completed bridge must never be sent twice.
  try {
    const status = await cash.relayStatus(route.requestId);
    route.lastStatus = status.status; saveOperation(op);
    if (status.status === 'success') { route.status = 'success'; route.destinationTransactions = status.txHashes; saveOperation(op); return route; }
    if (['failure','refund'].includes(status.status)) throw new Error(`Relay route ${route.requestId} ended in ${status.status}. Reconcile refund before creating a new operation.`);
  } catch (e) { if (!/404|not found/i.test(e.message)) throw e; }
  const client = await relayClient();
  let adapter;
  if (wallet.keypair) {
    const { adaptSolanaWallet } = await import('@relayprotocol/relay-svm-wallet-adapter');
    adapter = adaptSolanaWallet(wallet.address, wallet.route.chainId, wallet.connection, async (transaction, _options, _instructions, rawInstructions) => ({ signature: await solanaTransaction(op, `${label}:${fingerprint(rawInstructions).slice(0,24)}`, wallet, transaction, caps.sourceGas) }));
  } else {
    adapter = {
      vmType: 'evm', getChainId: async () => wallet.route.chainId, address: async () => wallet.address,
      supportsAtomicBatch: async () => false, isEOA: async () => ({ isEOA: true, isEIP7702Delegated: false }),
      switchChain: async chainId => { if (chainId !== wallet.route.chainId) throw new Error('Unexpected route chain switch.'); },
      handleSignMessageStep: async () => { throw new Error('Offchain route signatures are unsupported.'); },
      handleSendTransactionStep: async (chainId, item) => {
        if (chainId !== wallet.route.chainId) throw new Error('Unexpected route transaction chain.');
        validateEvmRouteTx(item.data, wallet, route);
        const txLabel = routeTransactionLabel(label, item.data, chainId);
        if (wallet.route.address === NATIVE && !op.transactions[txLabel]) {
          const priorValue = Object.entries(op.transactions).filter(([key]) => key.startsWith(`${label}:`)).reduce((sum,[,entry]) => sum + BigInt(entry.request?.value ?? 0), 0n);
          if (priorValue + BigInt(item.data.value ?? 0) > BigInt(route.input)) throw new Error('Aggregate route transfers exceed the approved source input.');
        }
        const result = await evmTransaction(op, txLabel, wallet, wallet.account, { to: item.data.to, data: item.data.data, value: BigInt(item.data.value ?? 0) }, wallet.route.chainId === 8453 ? caps.baseGas : caps.sourceGas);
        return result.transactionHash;
      },
      handleConfirmTransactionStep: async hash => wallet.publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 }),
    };
  }
  await client.actions.execute({ quote: structuredClone(route.quote), wallet: adapter, onProgress: () => {}, disableCapabilitiesCheck: true });
  const status = await waitForRelay(cash, route.requestId, { timeoutMs: 120_000 });
  route.status = status.status; route.destinationTransactions = status.txHashes; saveOperation(op);
  return route;
}
