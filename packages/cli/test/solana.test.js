import test from 'node:test';
import assert from 'node:assert/strict';
import {Keypair} from '@solana/web3.js';
import {loadSolanaKeypair,escrowAccount} from '../src/solana.js';
const B58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(bytes){let n=0n;for(const b of bytes)n=n*256n+BigInt(b);let s='';while(n>0n){s=B58[Number(n%58n)]+s;n/=58n;}for(const b of bytes){if(b!==0)break;s='1'+s;}return s;}
function withEnv(vars,fn){const before={};for(const k of Object.keys(vars)){before[k]=process.env[k];if(vars[k]===undefined)delete process.env[k];else process.env[k]=vars[k];}try{return fn();}finally{for(const[k,v]of Object.entries(before)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}}
const kp=Keypair.fromSeed(new Uint8Array(32).fill(7));
test('loads the same keypair from base58, JSON array and record formats',()=>{for(const raw of [b58(kp.secretKey),JSON.stringify(Array.from(kp.secretKey)),JSON.stringify({secretKey:Array.from(kp.secretKey)})]){const k=withEnv({PAYHUMANS_SOLANA_KEY:raw,PAYHUMANS_SOLANA_KEY_FILE:undefined},()=>loadSolanaKeypair());assert.equal(k.publicKey.toBase58(),kp.publicKey.toBase58());}});
test('missing key fails closed only when required',()=>{withEnv({PAYHUMANS_SOLANA_KEY:undefined,PAYHUMANS_SOLANA_KEY_FILE:undefined},()=>{assert.equal(loadSolanaKeypair({required:false}),null);assert.throws(()=>loadSolanaKeypair());});});
test('escrow account is deterministic per Solana key and distinct across keys',()=>{assert.equal(escrowAccount(kp).address,escrowAccount(Keypair.fromSecretKey(kp.secretKey)).address);assert.notEqual(escrowAccount(kp).address,escrowAccount(Keypair.fromSeed(new Uint8Array(32).fill(8))).address);});
test('rejects malformed keys',()=>{for(const raw of ['0OIl','[1,2,3]']) withEnv({PAYHUMANS_SOLANA_KEY:raw},()=>assert.throws(()=>loadSolanaKeypair()));});
