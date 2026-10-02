import { test } from "node:test";
import assert from "node:assert/strict";
import { getContracts } from "@zkp2p/sdk";
import {
  encodeEventTopics,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import {
  validateIntentTransaction,
  confirmedIntent,
} from "../src/lib/intent-transaction.ts";
const c = getContracts(8453, "production");
const to = c.addresses.orchestratorV3;
const tx = { chainId: 8453, to, value: "0" };
test("rejects wrong network, value, and recipient before wallet submission", () => {
  assert.doesNotThrow(() => validateIntentTransaction(tx));
  for (const bad of [
    { ...tx, chainId: 1 },
    { ...tx, value: "1" },
    { ...tx, to: "0x0000000000000000000000000000000000000001" },
  ])
    assert.throws(() => validateIntentTransaction(bad));
});
const hash = `0x${"ab".repeat(32)}`;
const account = "0x0000000000000000000000000000000000000001";
const event = c.abis.orchestratorV3.find(
  (i) => i.type === "event" && i.name === "IntentSignaled",
);
const args = { intentHash: hash, escrow: c.addresses.escrowV2, depositId: 1n };
const topics = encodeEventTopics({
  abi: [event],
  eventName: "IntentSignaled",
  args,
});
const data = encodeAbiParameters(
  parseAbiParameters("bytes32,address,address,uint256,bytes32,uint256,uint256"),
  [
    `0x${"01".repeat(32)}`,
    account,
    account,
    1000000n,
    `0x${"02".repeat(32)}`,
    1000000000000000000n,
    1n,
  ],
);
const receipt = { status: "success", logs: [{ address: to, topics, data }] };
test("recovers confirmed intent from the protocol contract event", () =>
  assert.equal(confirmedIntent(receipt), hash));
test("does not accept reverted claims or spoofed event emitters", () => {
  assert.throws(() => confirmedIntent({ ...receipt, status: "reverted" }));
  assert.throws(() =>
    confirmedIntent({
      ...receipt,
      logs: [{ ...receipt.logs[0], address: account }],
    }),
  );
  assert.throws(() => confirmedIntent({ ...receipt, logs: [] }));
});
