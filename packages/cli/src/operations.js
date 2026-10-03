import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { json, InvalidArgumentError } from './core.js';

export function operationDirectory() { return process.env.PAYHUMANS_STATE_DIR || path.join(os.homedir(), '.payhumans', 'operations'); }
export function validOperationId(id) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id ?? '')) throw new InvalidArgumentError('--operation-id must be 1–80 letters, digits, underscores or hyphens. Reuse the same ID to safely resume.');
  return id;
}
function canonical(value) { return Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value; }
export function fingerprint(value) { return createHash('sha256').update(json(canonical(value))).digest('hex'); }
export function readOperation(id) {
  validOperationId(id);
  try { return JSON.parse(fs.readFileSync(path.join(operationDirectory(), `${id}.json`), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') throw Object.assign(new Error(`Operation ${id} was not found. Run payhumans operations list and confirm PAYHUMANS_STATE_DIR uses the original operation journal.`), { code: 'OPERATION_NOT_FOUND' });
    throw error;
  }
}
export function listOperations() {
  if (!fs.existsSync(operationDirectory())) return [];
  return fs.readdirSync(operationDirectory()).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(operationDirectory(), f), 'utf8')));
}
export function saveOperation(op) {
  const dir = operationDirectory(); fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const destination = path.join(dir, `${validOperationId(op.id)}.json`);
  op.updatedAt = new Date().toISOString();
  const temporary = `${destination}.${randomUUID()}.tmp`;
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try { fs.writeFileSync(fd, json(op)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(temporary, destination);
  const directoryFd = fs.openSync(dir, 'r'); try { fs.fsyncSync(directoryFd); } finally { fs.closeSync(directoryFd); }
}
export function openOperation(id, kind, request, owner) {
  validOperationId(id);
  let op;
  try { op = readOperation(id); } catch (e) { if (e.code !== 'OPERATION_NOT_FOUND') throw e; }
  const requestHash = fingerprint({ kind, request, owner });
  if (op && op.requestHash !== requestHash) throw new Error(`Operation ${id} already exists with different parameters or wallet. Resume it, or deliberately use a new ID for a new payment.`);
  if (!op) { op = { schemaVersion: 1, id, kind, owner, request, requestHash, stage: 'created', createdAt: new Date().toISOString(), transactions: {}, routes: {} }; saveOperation(op); }
  return op;
}
// Owner-wide exclusion also prevents two different operation IDs racing for the same nonce/balance.
export async function withWalletLock(owner, fn) {
  const dir = operationDirectory(); fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, `wallet-${fingerprint(owner)}.lock`);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = fs.openSync(file, 'wx', 0o600);
      fs.writeFileSync(fd, json({ pid: process.pid })); fs.closeSync(fd);
      try { return await fn(); } finally { fs.unlinkSync(file); }
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const lock = JSON.parse(fs.readFileSync(file, 'utf8'));
      try { process.kill(lock.pid, 0); } catch (p) { if (p.code === 'ESRCH') { fs.unlinkSync(file); continue; } throw p; }
      throw new Error(`This wallet is in use by process ${lock.pid}. Wait for it to finish; do not run parallel funding commands.`);
    }
  }
  throw new Error('Could not acquire wallet operation lock.');
}
