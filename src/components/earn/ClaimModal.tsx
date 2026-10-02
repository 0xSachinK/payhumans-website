"use client";
import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { formatUnits, parseUnits, type Hex } from "viem";
import type { LiveJob } from "@/lib/protocol";
import { usePrivy } from "@privy-io/react-auth";
import IntentManager from "./IntentManager";
import {
  validateIntentTransaction,
  confirmedIntent,
} from "@/lib/intent-transaction";
export default function ClaimModal({
  job,
  onClose,
}: {
  job: LiveJob;
  onClose: () => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { login, authenticated } = usePrivy();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const [amount, setAmount] = useState(job.max);
  const [phase, setPhase] = useState<"review" | "pending" | "claimed">(
    "review",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tx, setTx] = useState<Hex>();
  const [intent, setIntent] = useState<string>();
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "pending") onClose();
      if (e.key === "Tab") {
        const all = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,a[href]",
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [onClose, phase]);
  let fiat = "—";
  try {
    const units = parseUnits(amount, 6) * BigInt(job.rateRaw);
    fiat = formatUnits((units + 10n ** 22n - 1n) / 10n ** 22n, 2);
  } catch {}
  async function claim() {
    setError("");
    try {
      if (!authenticated) {
        login({ loginMethods: ["passkey", "email"] });
        return;
      }
      if (!isConnected)
        throw new Error(
          "Your wallet is getting ready. Please try again shortly.",
        );
      if (chainId !== 8453) {
        await switchChainAsync({ chainId: 8453 });
        return;
      }
      if (!address || !publicClient)
        throw new Error("Connect your wallet first.");
      setPhase("pending");
      setMessage("Checking current escrow terms…");
      const response = await fetch("/api/intent/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: address,
          depositId: job.depositId,
          jobId: job.id,
          amount,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (
        body.job.rateRaw !== job.rateRaw ||
        body.job.payeeHash !== job.payeeHash
      )
        throw new Error(
          "Payment terms changed. Close and reload the request before claiming.",
        );
      validateIntentTransaction(body.transaction);
      await publicClient.call({
        account: address,
        to: body.transaction.to,
        data: body.transaction.data,
        value: 0n,
      });
      setMessage("Confirm the intent transaction in your wallet.");
      const hash = await sendTransactionAsync({
        to: body.transaction.to,
        data: body.transaction.data,
        value: BigInt(body.transaction.value),
        chainId: 8453,
      });
      setTx(hash);
      const pendingUrl = new URL(window.location.href);
      pendingUrl.searchParams.set("claimTx", hash);
      window.history.replaceState({}, "", pendingUrl);
      setMessage("Waiting for confirmation on Base…");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const intentHash = confirmedIntent(receipt);
      setIntent(intentHash);
      const url = new URL(window.location.href);
      url.searchParams.delete("claimTx");
      url.searchParams.set("intent", intentHash);
      window.history.replaceState({}, "", url);
      setPhase("claimed");
      setMessage("Your intent is confirmed.");
    } catch (e) {
      setError(
        (e as { shortMessage?: string }).shortMessage ||
          (e instanceof Error ? e.message : "Unable to claim."),
      );
      setPhase("review");
    }
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Claim payment job"
        className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl bg-[#0b0d0c] border border-white/15 p-6 md:p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {phase === "claimed" ? "Job claimed" : "Review this payment"}
          </h2>
          <button
            ref={closeButton}
            disabled={phase === "pending"}
            onClick={onClose}
            aria-label="Close modal"
            className="px-2 text-xl disabled:opacity-30"
          >
            ×
          </button>
        </div>
        <dl className="text-sm space-y-4 mb-6">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Payment platform</dt>
            <dd className="capitalize">{job.platform}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] mb-1">Recipient</dt>
            <dd className="break-all">{job.recipient}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">You send</dt>
            <dd>
              {fiat} {job.currency}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Escrow amount</dt>
            <dd>{amount} USDC</dd>
          </div>
        </dl>
        {phase !== "claimed" && (
          <label className="block text-sm mb-5">
            USDC to claim ({job.min}–{job.max})
            <input
              value={amount}
              disabled={phase === "pending" || !!tx}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="block w-full bg-white/5 border border-white/15 rounded-lg p-3 mt-2"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-amber-200 text-sm mb-5 break-words">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-[var(--green)] mb-4">
            {message}
          </p>
        )}
        {tx && (
          <a
            href={`https://basescan.org/tx/${tx}`}
            target="_blank"
            rel="noreferrer"
            className="block text-sm underline mb-4"
          >
            View claim transaction on Base ↗
          </a>
        )}
        {phase === "claimed" ? (
          <div>
            <p className="text-sm mb-5 text-[var(--muted)]">
              Your payment intent was created on this website. Send only after
              checking its active status and expiry. Payment verification must
              succeed before USDC is released; claiming alone is not a payout.
            </p>
            <div className="p-4 border border-white/10 rounded-xl mb-5">
              <div className="text-xs text-[var(--muted)] mb-2">
                Intent hash
              </div>
              <code className="break-all text-xs">{intent}</code>
            </div>
            {intent && <IntentManager hash={intent} />}
            <a
              href="/docs#humans"
              className="block text-center bg-[var(--green)] text-black rounded-xl py-3 font-medium"
            >
              Payment & verification guide
            </a>
            <p className="text-xs text-[var(--muted)] mt-4">
              Keep this transaction link to recover the intent. Never pay twice
              or submit a payment after its intent expires.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)] mb-5">
              This reserves escrow; it does not send fiat. Wallet network fees
              and protocol fees may apply. Use only payment accounts you own.
            </p>
            <button
              onClick={() => void claim()}
              disabled={phase === "pending" || !!tx}
              className="w-full rounded-xl bg-[var(--green)] text-black py-3 font-medium disabled:opacity-50"
            >
              {phase === "pending"
                ? "Confirming…"
                : tx
                  ? "Transaction submitted — check status"
                  : !authenticated
                    ? "Sign in to claim"
                    : chainId !== 8453
                      ? "Switch to Base"
                      : "Sign & claim job"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
