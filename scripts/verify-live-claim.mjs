// Read-only integration check. No wallet client, private key, or broadcast method.
import { apiGetOrderbook, getContracts, setLogLevel } from "@zkp2p/sdk";
import { createPublicClient, http, isAddress, parseUnits } from "viem";
import { base } from "viem/chains";
import { validateIntentTransaction } from "../src/lib/intent-transaction.ts";

setLogLevel("error");
const account = process.env.PAYHUMANS_QA_ACCOUNT;
if (!isAddress(account ?? ""))
  throw new Error(
    "Set PAYHUMANS_QA_ACCOUNT to a public wallet address. No key is needed.",
  );
const site = process.env.PAYHUMANS_SITE_URL || "https://payhumans.ai";
const book = await apiGetOrderbook(
  {
    currency: "USD",
    paymentPlatform: "revolut",
    mode: "eligible",
    takerAddress: account,
    limit: 10,
    chainId: 8453,
    showSmallOrders: true,
  },
  "https://api.zkp2p.xyz",
  15000,
);
const escrow = getContracts(8453, "production").addresses.escrowV2;
const entry = book.entries.find(
  (e) =>
    e.escrowAddress.toLowerCase() === escrow.toLowerCase() &&
    BigInt(e.intentAmountMin) >= 1000n &&
    BigInt(e.intentAmountMin) <= 5_000_000n,
);
if (!entry?.depositIdOnContract)
  throw new Error(
    "No suitable current deposit. Live simulation was not completed.",
  );
const jobsResponse = await fetch(
  `${site}/api/jobs?deposit=${entry.depositIdOnContract}`,
);
const jobs = await jobsResponse.json();
if (!jobsResponse.ok) throw new Error(jobs.error);
const job = jobs.jobs.find(
  (j) => j.platform === "revolut" && j.currency === "USD" && j.accepting,
);
if (!job || parseUnits(job.min, 6) > 5_000_000n)
  throw new Error(
    "Request unavailable or terms changed. Live simulation was not completed.",
  );
const response = await fetch(`${site}/api/intent/prepare`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    account,
    depositId: job.depositId,
    jobId: job.id,
    amount: job.min,
  }),
});
const body = await response.json();
if (!response.ok) throw new Error(body.error);
validateIntentTransaction(body.transaction);
const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});
await client.call({
  account,
  to: body.transaction.to,
  data: body.transaction.data,
  value: 0n,
});
console.log(
  JSON.stringify(
    {
      mode: "read-only eth_call",
      site,
      depositId: job.depositId,
      amount: job.min,
      chainId: 8453,
      target: body.transaction.to,
      account,
      simulation: "success",
      signed: false,
      broadcast: false,
      fundsMoved: 0,
      timestamp: new Date().toISOString(),
    },
    null,
    2,
  ),
);
