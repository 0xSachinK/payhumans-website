import test from 'node:test';
import assert from 'node:assert/strict';
import { depositDisputeSettings, listDeposits, normalizedOrder } from '../src/deposits.js';
const escrow='0x777777779d229cdf3110e9de47943791c26300ef';
test('partial fill totals keep available, reserved, released and returned separate',()=>{
  const indexed={depositor:'owner',remainingDeposits:'2000000',outstandingIntentAmount:'1000000',totalAmountTaken:'3000000',totalWithdrawn:'4000000',status:'ACTIVE',intents:[],updatedAt:'1'};
  const result=normalizedOrder('1',escrow,{deposit:{depositor:'owner',outstandingIntentAmount:1000000n},availableLiquidity:2000000n},indexed);
  assert.deepEqual([result.funded,result.available,result.reserved,result.fulfilled,result.withdrawn],['10','2','1','3','4']);
  assert.equal(result.state,'delivering');assert.equal(result.liquiditySource,'chain');
  assert.deepEqual(result.intentAmountUnits,{asset:'USDC',decimals:6,encoding:'integer-base-units',fields:['amount','releasedAmount','takerAmountNetFees']});
});
test('closed withdrawn order remains discoverable from history without a live contract record',()=>{
  const result=normalizedOrder('1',escrow,null,{depositor:'owner',remainingDeposits:'0',outstandingIntentAmount:'0',totalAmountTaken:'0',totalWithdrawn:'5000000',status:'WITHDRAWN',intents:[],updatedAt:'1'});
  assert.equal(result.state,'returned');assert.equal(result.withdrawn,'5');assert.equal(result.available,'0');assert.equal(result.liquiditySource,'indexer');
});
test('owner history finds a new V2 deposit despite an empty viewer and retains withdrawn orders across pages',async()=>{
  const owner='0x8D473EAcd54Fcd5Ed9aCeB150712822a812051e8';
  const rows=[
    {depositId:'6020',id:`${escrow}_6020`,chainId:8453,escrowAddress:escrow,depositor:owner,remainingDeposits:'4000000',outstandingIntentAmount:'1000000',totalAmountTaken:'0',totalWithdrawn:'0',status:'ACTIVE',intents:[],updatedAt:'1'},
    {depositId:'6021',id:`${escrow}_6021`,chainId:8453,escrowAddress:escrow,depositor:owner,remainingDeposits:'0',outstandingIntentAmount:'0',totalAmountTaken:'0',totalWithdrawn:'5000000',status:'WITHDRAWN',intents:[],updatedAt:'2'},
  ];
  const offsets=[];
  const client={
    getDeployedAddresses:()=>({escrow:'0x0000000000000000000000000000000000000001',escrowV2:escrow}),
    getAccountDeposits:async()=>[],
    indexer:{getDepositsWithRelations:async(filter,pagination,options)=>{
      assert.deepEqual(filter,{depositor:owner,chainId:8453,escrowAddress:escrow});
      assert.equal(filter.status,undefined);
      assert.equal(pagination.orderBy,'timestamp');assert.equal(pagination.orderDirection,'asc');
      assert.equal(options.includeIntents,true);offsets.push(pagination.offset);
      return rows.slice(pagination.offset,pagination.offset+pagination.limit);
    }},
  };
  const result=await listDeposits(owner,{client,pageSize:1});
  assert.deepEqual(offsets,[0,1,2]);
  assert.deepEqual(result.map(r=>r.depositId),['6020','6021']);
  assert.deepEqual([result[0].funded,result[0].available,result[0].reserved],['5','4','1']);
  assert.equal(result[0].liquiditySource,'indexer');
  assert.equal(result[1].withdrawn,'5');assert.equal(result[1].state,'returned');
});
test('owner history fails explicitly on indexer failure or wrong escrow scope',async()=>{
  const owner='0x8D473EAcd54Fcd5Ed9aCeB150712822a812051e8';
  const failure=new Error('Indexer unavailable');
  const client={getDeployedAddresses:()=>({escrowV2:escrow}),indexer:{getDepositsWithRelations:async()=>{throw failure;}}};
  await assert.rejects(listDeposits(owner,{client}),error=>error===failure);
  client.indexer.getDepositsWithRelations=async()=>[{depositId:'6020',chainId:8453,depositor:owner,escrowAddress:'0x0000000000000000000000000000000000000001'}];
  await assert.rejects(listDeposits(owner,{client}),/outside the requested owner or current Base escrow/);
});
test('dispute settings read the live opt-in and risk window instead of assuming stake from create flags',async()=>{
  const paymentMethod='0x617f88ab82b5c1b014c539f7e75121427f0bb50a4c58b187a238531e7d58605d';
  const onchain={paymentMethods:[{paymentMethod}]};
  let enabled=false,riskWindow=3600n;
  const client={isDisputeProtectionEnabled:async(e,id,method)=>{assert.equal(e,escrow);assert.equal(id,6020n);assert.equal(method,paymentMethod);return enabled;},getRiskWindow:async method=>{assert.equal(method,paymentMethod);return riskWindow;}};
  let [setting]=await depositDisputeSettings(client,'6020',escrow,onchain,{status:'ACTIVE'});
  assert.equal(setting.platform,'revolut');assert.equal(setting.enabled,false);assert.equal(setting.requiresStake,false);assert.equal(setting.source,'chain');
  enabled=true;
  [setting]=await depositDisputeSettings(client,'6020',escrow,onchain,{status:'ACTIVE'});
  assert.equal(setting.requiresStake,true);assert.equal(setting.riskWindowSeconds,'3600');
  riskWindow=0n;
  [setting]=await depositDisputeSettings(client,'6020',escrow,onchain,{status:'ACTIVE'});
  assert.equal(setting.enabled,true);assert.equal(setting.requiresStake,false);
});
test('closed deposits and policy read failures keep dispute settings unknown',async()=>{
  const paymentMethod='0x617f88ab82b5c1b014c539f7e75121427f0bb50a4c58b187a238531e7d58605d';
  const indexed={status:'WITHDRAWN',paymentMethods:[{paymentMethodHash:paymentMethod}]};
  const [closed]=await depositDisputeSettings({},'6020',escrow,null,indexed);
  assert.equal(closed.enabled,null);assert.equal(closed.requiresStake,null);assert.equal(closed.source,'unknown');
  const [empty]=await depositDisputeSettings({},'6020',escrow,{paymentMethods:[{paymentMethod}],availableLiquidity:0n,deposit:{outstandingIntentAmount:0n}},{status:'ACTIVE'});
  assert.equal(empty.enabled,null);assert.equal(empty.requiresStake,null);
  const client={isDisputeProtectionEnabled:async()=>{throw new Error('HTTP 429');},getRiskWindow:async()=>3600n};
  const [failed]=await depositDisputeSettings(client,'6020',escrow,{paymentMethods:[{paymentMethod}]},{status:'ACTIVE'});
  assert.equal(failed.enabled,null);assert.equal(failed.requiresStake,null);assert.equal(failed.error.retryable,true);
});
