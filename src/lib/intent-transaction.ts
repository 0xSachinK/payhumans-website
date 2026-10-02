import { getContracts } from "@zkp2p/sdk";
import { parseEventLogs, type TransactionReceipt } from "viem";

function contracts() {
  return getContracts(8453, "production");
}
export function validateIntentTransaction(tx: {
  chainId: number;
  to: string;
  value: string | bigint;
}) {
  const addresses = contracts().addresses;
  const targets = [
    addresses.orchestratorV3,
    addresses.orchestratorV2,
    addresses.orchestrator,
  ].filter(Boolean);
  if (
    tx.chainId !== 8453 ||
    !targets.some((a) => a!.toLowerCase() === tx.to.toLowerCase()) ||
    BigInt(tx.value) !== 0n
  ) {
    throw new Error("Unexpected intent transaction. No transaction was sent.");
  }
}

export function confirmedIntent(receipt: TransactionReceipt) {
  if (receipt.status !== "success")
    throw new Error("Claim transaction reverted. Do not send fiat.");
  const { addresses, abis } = contracts();
  const targets = [
    addresses.orchestratorV3,
    addresses.orchestratorV2,
    addresses.orchestrator,
  ].filter(Boolean);
  const abi = abis.orchestratorV3 ?? abis.orchestrator;
  if (!abi) throw new Error("Intent ABI unavailable.");
  const logs = receipt.logs.filter((log) =>
    targets.some((a) => a!.toLowerCase() === log.address.toLowerCase()),
  );
  const event = parseEventLogs({ abi, logs, strict: false }).find(
    (e) => e.eventName === "IntentSignaled",
  );
  const hash =
    event && "args" in event
      ? (event.args as { intentHash?: string }).intentHash
      : undefined;
  if (!hash)
    throw new Error(
      "Transaction confirmed, but no valid claim event was found. Inspect the transaction before taking any further action.",
    );
  return hash;
}
