import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256 } from 'viem';
import { openOperation, readOperation, saveOperation, withWalletLock, fingerprint } from '../src/operations.js';
import { evmTransaction } from '../src/transactions.js';

async function state(fn) { const before=process.env.PAYHUMANS_STATE_DIR; const dir=fs.mkdtempSync(path.join(os.tmpdir(),'payhumans-test-'));process.env.PAYHUMANS_STATE_DIR=dir;try{await fn(dir);}finally{if(before===undefined)delete process.env.PAYHUMANS_STATE_DIR;else process.env.PAYHUMANS_STATE_DIR=before;fs.rmSync(dir,{recursive:true,force:true});} }
test('operation IDs are idempotent and reject changed amount or wallet',async()=>state(async dir=>{
  const a=openOperation('invoice_1','create',{amount:'5',platform:'revolut'},'owner');
  a.stage='funding';saveOperation(a);
  assert.equal(openOperation('invoice_1','create',{platform:'revolut',amount:'5'},'owner').stage,'funding');
  assert.throws(()=>openOperation('invoice_1','create',{amount:'6',platform:'revolut'},'owner'),/different parameters/);
  assert.throws(()=>openOperation('../escape','create',{},'owner'));
  assert.equal(fs.statSync(path.join(dir,'invoice_1.json')).mode & 0o777,0o600);
  assert.equal(fingerprint({a:1,b:2}),fingerprint({b:2,a:1}));
}));
test('wallet lock prevents parallel operations and is released on error',async()=>state(async()=>{
  await withWalletLock('owner',async()=>{await assert.rejects(withWalletLock('owner',async()=>{}),/in use/);});
  await assert.rejects(withWalletLock('owner',async()=>{throw new Error('fixture');}),/fixture/);
  await withWalletLock('owner',async()=>{});
}));
test('deposit hash and public request are durable before broadcast, resume never allocates another nonce',async()=>state(async()=>{
  const account=privateKeyToAccount('0x'+'12'.repeat(32));
  const op=openOperation('crash','create',{amount:'5'},account.address);
  let broadcasts=0,prepared=0,mined=false,lastSerialized;
  const missing=()=>Object.assign(new Error('not mined'),{name:'TransactionReceiptNotFoundError'});
  const clients={chain:{id:1},walletClient:{prepareTransactionRequest:async tx=>{prepared++;return{...tx,type:'eip1559',chainId:1,gas:21000n,maxFeePerGas:100n,maxPriorityFeePerGas:1n};}},publicClient:{
    getChainId:async()=>1,getTransactionCount:async()=>3,
    getTransactionReceipt:async()=>{if(!mined)throw missing();return{status:'success',transactionHash:readOperation('crash').transactions.deposit.transactionHash,blockNumber:22n,gasUsed:21000n};},
    sendRawTransaction:async({serializedTransaction})=>{broadcasts++;lastSerialized=serializedTransaction;const saved=readOperation('crash').transactions.deposit;assert.equal(saved.transactionHash,keccak256(serializedTransaction));assert.equal(saved.request.nonce,3);assert.ok(!JSON.stringify(saved).includes(account.privateKey??'SECRET-NOT-STORED'));return saved.transactionHash;},
    waitForTransactionReceipt:async()=>{throw new Error('simulated receipt timeout');},
  }};
  await assert.rejects(evmTransaction(op,'deposit',clients,account,{to:'0x0000000000000000000000000000000000000001',value:1n},1000000000n),/timeout/);
  mined=true;
  const receipt=await evmTransaction(readOperation('crash'),'deposit',clients,account,{},1000000000n);
  assert.equal(receipt.status,'success');assert.equal(prepared,1);assert.equal(broadcasts,1);assert.ok(lastSerialized);
}));
test('gas budget stops signing and broadcasting before spend',async()=>state(async()=>{
  const account=privateKeyToAccount('0x'+'12'.repeat(32));
  const op=openOperation('fee','create',{},account.address);
  const clients={chain:{id:1},walletClient:{prepareTransactionRequest:async tx=>({...tx,gas:21000n,maxFeePerGas:100n})},publicClient:{getChainId:async()=>1,getTransactionCount:async()=>0}};
  await assert.rejects(evmTransaction(op,'deposit',clients,account,{to:account.address,value:0n},1n),/gas budget/);
  assert.deepEqual(op.transactions,{});
}));

test('confirmed approval skipped on resume cannot be mistaken for deposit transaction',async()=>state(async()=>{
  const {routeTransactionLabel}=await import('../src/transactions.js');
  const account=privateKeyToAccount('0x'+'13'.repeat(32));
  const approve={to:'0x0000000000000000000000000000000000000002',data:'0x095ea7b3',value:0n};
  const deposit={to:'0x0000000000000000000000000000000000000003',data:'0x12345678',value:3n};
  const approvalLabel=routeTransactionLabel('funding',approve,1),depositLabel=routeTransactionLabel('funding',deposit,1);
  assert.notEqual(approvalLabel,depositLabel);
  assert.equal(depositLabel,routeTransactionLabel('funding',{...deposit,value:'0x3'},1));
  const op=openOperation('skip-approval','create',{},account.address);op.transactions[approvalLabel]={kind:'evm',chainId:1,maximumFee:'100',transactionHash:'prior-approval',receipt:{status:'success'}};saveOperation(op);
  let nonceUsed,hash;
  const clients={chain:{id:1},walletClient:{prepareTransactionRequest:async tx=>{nonceUsed=tx.nonce;return{...tx,type:'eip1559',chainId:1,gas:21000n,maxFeePerGas:100n,maxPriorityFeePerGas:1n};}},publicClient:{getChainId:async()=>1,getTransactionCount:async()=>1,getTransactionReceipt:async()=>{throw Object.assign(new Error('missing'),{name:'TransactionReceiptNotFoundError'});},sendRawTransaction:async({serializedTransaction})=>{hash=keccak256(serializedTransaction);return hash;},waitForTransactionReceipt:async()=>({status:'success',transactionHash:hash,blockNumber:12n,gasUsed:21000n})}};
  await evmTransaction(op,depositLabel,clients,account,deposit,1000000000n);
  assert.equal(nonceUsed,1);assert.notEqual(hash,'prior-approval');assert.equal(Object.keys(op.transactions).length,2);
}));
