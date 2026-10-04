import { test } from "node:test";
import assert from "node:assert/strict";
import { errorMessage } from "../src/lib/protocol.ts";

test("public API errors do not expose credential-bearing RPC URLs", () => {
  const result = errorMessage(new Error("Fetch failed at https://rpc.example/v2/private-token?key=secret after timeout"));
  assert.equal(result, "Fetch failed at [service endpoint] after timeout");
  assert.equal(result.includes("private-token"), false);
});

test("public API errors retain actionable short messages", () => {
  assert.equal(errorMessage({ shortMessage: "Claim between 1 and 5 USDC.", message: "internal context" }), "Claim between 1 and 5 USDC.");
});
