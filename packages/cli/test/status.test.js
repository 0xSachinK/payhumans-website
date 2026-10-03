import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizedOrder } from '../src/deposits.js';
const escrow='0x777777779d229cdf3110e9de47943791c26300ef';
test('partial fill totals keep available, reserved, released and returned separate',()=>{
  const indexed={depositor:'owner',remainingDeposits:'2000000',outstandingIntentAmount:'1000000',totalAmountTaken:'3000000',totalWithdrawn:'4000000',status:'ACTIVE',intents:[],updatedAt:'1'};
  const result=normalizedOrder('1',escrow,{deposit:{depositor:'owner',outstandingIntentAmount:1000000n},availableLiquidity:2000000n},indexed);
  assert.deepEqual([result.funded,result.available,result.reserved,result.fulfilled,result.withdrawn],['10','2','1','3','4']);
  assert.equal(result.state,'delivering');assert.equal(result.liquiditySource,'chain');
});
test('closed withdrawn order remains discoverable from history without a live contract record',()=>{
  const result=normalizedOrder('1',escrow,null,{depositor:'owner',remainingDeposits:'0',outstandingIntentAmount:'0',totalAmountTaken:'0',totalWithdrawn:'5000000',status:'WITHDRAWN',intents:[],updatedAt:'1'});
  assert.equal(result.state,'returned');assert.equal(result.withdrawn,'5');assert.equal(result.available,'0');assert.equal(result.liquiditySource,'indexer');
});
