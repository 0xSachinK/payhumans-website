"use client";
import { useState } from "react";
import { usePublicClient } from "wagmi";
import type { Hex } from "viem";
import { confirmedIntent } from "@/lib/intent-transaction";

export default function ClaimRecovery({
  hash,
  onRecovered,
}: {
  hash: Hex;
  onRecovered: (intent: string) => void;
}) {
  const client = usePublicClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function recover() {
    if (!client) return;
    setBusy(true);
    setError("");
    try {
      const receipt = await client.getTransactionReceipt({ hash });
      const intent = confirmedIntent(receipt);
      const url = new URL(window.location.href);
      url.searchParams.delete("claimTx");
      url.searchParams.set("intent", intent);
      window.history.replaceState({}, "", url);
      onRecovered(intent);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Confirmation unavailable. Check the transaction link.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="border border-amber-300/30 rounded-xl p-5 mb-8">
      <h3 className="font-medium">Recover your submitted claim</h3>
      <p className="text-sm text-[var(--muted)] my-3">
        A claim was already submitted. Check its confirmation before making
        another claim or sending fiat.
      </p>
      <a
        className="text-sm underline"
        href={`https://basescan.org/tx/${hash}`}
        target="_blank"
        rel="noreferrer"
      >
        View transaction ↗
      </a>
      <button
        disabled={busy}
        onClick={() => void recover()}
        className="block mt-4 text-sm underline disabled:opacity-50"
      >
        {busy ? "Checking…" : "Recover confirmed intent"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-amber-200 mt-3 break-words">
          {error}
        </p>
      )}
    </section>
  );
}
