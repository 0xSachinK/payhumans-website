import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {decimal,validateCreate,depositId,safeError,errorOutput} from '../src/core.js';
const request={platform:'venmo',recipient:'example-recipient',amount:'5',currency:'USD',rate:'0.98'};
test('keeps exact amounts and bounds the claim to the funded deposit',()=>{const r=validateCreate(request);assert.equal(r.amount,5_000_000n);assert.equal(r.rate,980000000000000000n);assert.equal(r.min,1_000_000n);assert.equal(r.max,r.amount);});
test('rejects malformed, rounded, negative, zero and exponential amounts',()=>{for(const amount of ['0','-1','NaN','Infinity','1e4','1.0000001','0x10',' 5',''])assert.throws(()=>decimal(amount,'amount'));});
test('rejects unsupported platform/currency and inconsistent claim ranges',()=>{for(const change of [{platform:'unknown'},{currency:'EUR'},{min:'6'},{max:'6'},{min:'4',max:'3'},{recipient:''},{maxSpend:'4.99'}])assert.throws(()=>validateCreate({...request,...change}));});
test('accepts explicit USD cap equality and normalizes names',()=>{assert.equal(validateCreate({...request,platform:'VENMO',currency:'usd',maxSpend:'5'}).platform,'venmo');});
test('rejects nonintegral and signed deposit IDs',()=>{for(const id of ['-1','1.1','1e3',''])assert.throws(()=>depositId(id));assert.equal(depositId('0'),0n);});
test('redacts signing material from errors',()=>{const before=process.env.PAYHUMANS_SOLANA_KEY;process.env.PAYHUMANS_SOLANA_KEY='secret-fixture';assert.equal(safeError(Error('failed secret-fixture')),'failed [REDACTED]');if(before===undefined)delete process.env.PAYHUMANS_SOLANA_KEY;else process.env.PAYHUMANS_SOLANA_KEY=before;});
test('default create is a keyless offline preview and unsupported arguments fail closed',()=>{const env={...process.env,PAYHUMANS_SOLANA_KEY:'',PAYHUMANS_SOLANA_KEY_FILE:'',PAYHUMANS_ESCROW_RPC_URL:'http://127.0.0.1:1',PAYHUMANS_SOLANA_RPC_URL:'http://127.0.0.1:1'};const args=['src/cli.js','deposit','create','--platform','venmo','--recipient','example','--amount','5','--currency','USD','--rate','0.98'];const result=spawnSync(process.execPath,args,{env,encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).mode,'preview');assert.equal(spawnSync(process.execPath,[...args,'--yes'],{env,encoding:'utf8'}).status,1);assert.notEqual(spawnSync(process.execPath,['src/cli.js','transfer'],{env,encoding:'utf8'}).status,0);});
test('local validation yields INVALID_ARGUMENT without relabeling provider failures',()=>{
  for(const amount of ['0','-1','1e4','1.0000001']) {
    assert.throws(()=>decimal(amount,'amount'),error=>errorOutput(error).error.code==='INVALID_ARGUMENT');
  }
  const args=['src/cli.js','deposit','create','--platform','venmo','--recipient','example','--amount','0','--currency','USD','--rate','0.98'];
  const result=spawnSync(process.execPath,args,{encoding:'utf8'});
  assert.equal(result.status,1);
  assert.equal(JSON.parse(result.stderr).error.code,'INVALID_ARGUMENT');
  assert.equal(errorOutput(new Error('Provider rejected amount: must be greater than zero.')).error.code,'REQUEST_FAILED');
  assert.equal(errorOutput(Object.assign(new Error('Rate limited'),{code:'RATE_LIMITED'})).error.code,'RATE_LIMITED');
});
test('keyless list explains the Solana default and offers owner or source-chain selection',()=>{
  const env={...process.env,PAYHUMANS_SOLANA_KEY:'',PAYHUMANS_SOLANA_KEY_FILE:''};
  const result=spawnSync(process.execPath,['src/cli.js','deposit','list'],{env,encoding:'utf8'});
  assert.equal(result.status,1);
  const error=JSON.parse(result.stderr).error;
  assert.equal(error.code,'INVALID_ARGUMENT');
  assert.match(error.message,/--owner/);assert.match(error.message,/--source-chain/);assert.match(error.message,/default.*solana/i);
});
test('throttling remediation preserves provider code and redacts RPC credentials',()=>{
  const previous=process.env.PAYHUMANS_RPC_8453;
  process.env.PAYHUMANS_RPC_8453='https://example.invalid/private-rpc-fixture';
  try {
    const error=errorOutput(Object.assign(new Error(`HTTP 429 at ${process.env.PAYHUMANS_RPC_8453}`),{code:-32005})).error;
    assert.equal(error.code,-32005);assert.equal(error.retryable,true);
    assert.match(error.next,/PAYHUMANS_ESCROW_RPC_URL/);assert.match(error.next,/PAYHUMANS_RPC_<chainId>/);assert.match(error.next,/same operation ID/);
    assert.ok(!error.message.includes('private-rpc-fixture'));
    assert.equal(errorOutput(new Error('Provider unavailable')).error.retryable,undefined);
  } finally { if(previous===undefined)delete process.env.PAYHUMANS_RPC_8453;else process.env.PAYHUMANS_RPC_8453=previous; }
});
