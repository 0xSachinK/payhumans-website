import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceRoute, sourceBalances, limits, assertSpendBudget, assertQuote } from '../src/funding.js';
const owner='0x0000000000000000000000000000000000000001';
test('Solana mainnet balances pass the full genesis hash and reject other clusters',async()=>{
  let genesis='5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  const wallet={route:sourceRoute({sourceChain:'solana',sourceAsset:'SOL'}),keypair:{publicKey:{}},connection:{getGenesisHash:async()=>genesis,getBalance:async()=>12345,getParsedTokenAccountsByOwner:async()=>({value:[]})}};
  assert.equal((await sourceBalances(wallet)).amount,12345n);
  genesis='EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
  await assert.rejects(()=>sourceBalances(wallet),/not mainnet-beta/);
});
test('source chain and native assets remain distinct',()=>{
  assert.equal(sourceRoute({sourceChain:'ethereum',sourceAsset:'ETH'}).chainId,1);
  assert.equal(sourceRoute({sourceChain:'bitcoin',sourceAsset:'BTC'}).mode,'external-wallet');
  assert.throws(()=>sourceRoute({sourceChain:'ethereum',sourceAsset:'BTC'}));
  assert.throws(()=>sourceRoute({sourceChain:'bitcoin',sourceAsset:'WBTC'}));
  assert.equal(sourceRoute({sourceChain:'solana',sourceAsset:'SOL'}).decimals,9);
});
test('writes require a source-unit cap and bounded slippage',()=>{
  const route=sourceRoute({sourceChain:'ethereum',sourceAsset:'ETH'});
  assert.throws(()=>limits({yes:true,maxSpend:'5'},route),/max-source-spend/);
  assert.equal(limits({yes:true,maxSourceSpend:'0.003'},route).sourceSpend,3000000000000000n);
  for(const slippageBps of ['NaN','1.1','101','-1'])assert.throws(()=>limits({slippageBps},route));
});
test('persisted gas/funding routes consume one cumulative source spend budget',()=>{
  assert.equal(assertSpendBudget({routes:{gas:{input:'100'}}},400n,500n),500n);
  assert.throws(()=>assertSpendBudget({routes:{gas:{input:'100'}}},401n,500n),/exceeds/);
});
test('quotes fail closed on recipient, minimum output, signatures and source mismatches',()=>{
  const route=sourceRoute({sourceChain:'ethereum',sourceAsset:'ETH'}),wallet={route,address:owner,account:{address:owner}};
  const destination={address:'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'};
  const raw={details:{sender:owner,recipient:owner,currencyIn:{currency:{chainId:1,address:route.address},amount:'1000'},currencyOut:{currency:{chainId:8453,address:destination.address},amount:'5000000',minimumAmount:'5000000'}},steps:[{requestId:'request',kind:'transaction'}]};
  assert.equal(assertQuote(raw,wallet,destination,5000000n).input,1000n);
  for(const mutate of [r=>r.details.recipient='0x0000000000000000000000000000000000000002',r=>r.details.currencyOut.minimumAmount='4999999',r=>r.steps[0].kind='signature',r=>r.details.currencyIn.currency.chainId=8453]){const changed=structuredClone(raw);mutate(changed);assert.throws(()=>assertQuote(changed,wallet,destination,5000000n));}
});

test('Bitcoin refunds require valid mainnet checksums, not just an address-shaped string',async()=>{
  const {bitcoinAddress}=await import('../src/funding.js');
  assert.equal(bitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'),true);
  assert.equal(bitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb'),false);
  assert.equal(bitcoinAddress('bc1qqyqszqgpqyqszqgpqyqszqgpqyqszqgpyfl4f3'),true);
  assert.equal(bitcoinAddress('tb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8'),false);
});
