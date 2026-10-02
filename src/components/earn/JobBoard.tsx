"use client";
import { useEffect, useState } from "react";
import type { LiveJob } from "@/lib/protocol";
import ClaimModal from "./ClaimModal";
import IntentManager from "./IntentManager";
import ClaimRecovery from "./ClaimRecovery";
import type { Hex } from "viem";
export default function JobBoard() {
  const [pendingClaim, setPendingClaim] = useState<Hex>();
  const [recoveredIntent, setRecoveredIntent] = useState("");
  const [id, setId] = useState("");
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<LiveJob | null>(null);
  async function load(deposit: string) {
    setLoading(true);
    setError("");
    setJobs([]);
    try {
      const r = await fetch(`/api/jobs?deposit=${encodeURIComponent(deposit)}`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error);
      setJobs(body.jobs);
      if (!body.jobs.length)
        setError("No supported payment methods were found for this deposit.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load request.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const pending = new URLSearchParams(window.location.search).get("claimTx");
    if (pending && /^0x[a-fA-F0-9]{64}$/.test(pending))
      setPendingClaim(pending as Hex);
    const saved = new URLSearchParams(window.location.search).get("intent");
    if (saved && /^0x[a-fA-F0-9]{64}$/.test(saved)) setRecoveredIntent(saved);
    const deposit = new URLSearchParams(window.location.search).get("deposit");
    if (deposit) {
      setId(deposit);
      void load(deposit);
    }
  }, []);
  return (
    <section id="jobs" className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {pendingClaim && (
          <ClaimRecovery
            hash={pendingClaim}
            onRecovered={(intent) => {
              setPendingClaim(undefined);
              setRecoveredIntent(intent);
            }}
          />
        )}
        {recoveredIntent && !selected && (
          <IntentManager hash={recoveredIntent} />
        )}
        <p className="text-xs tracking-widest uppercase text-[var(--green)] mb-3">
          Payment requests
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Find your next payment job.
        </h2>
        <p className="text-[var(--muted)] max-w-2xl mb-7">
          Open the request link shared by an agent, or enter its deposit ID.
          Every request below is read from USDC escrow on Base. Check the
          recipient and payment terms before claiming.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(id);
          }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <label className="sr-only" htmlFor="deposit-id">
            Deposit ID
          </label>
          <input
            id="deposit-id"
            inputMode="numeric"
            pattern="[0-9]+"
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter deposit ID"
            className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 min-w-0 flex-1"
          />
          <button
            disabled={loading}
            className="bg-[var(--green)] text-black font-medium rounded-xl px-5 py-3 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Find request"}
          </button>
        </form>
        {error && (
          <p
            role="alert"
            className="p-4 border border-amber-500/30 text-amber-200 rounded-xl"
          >
            {error}
          </p>
        )}
        {!jobs.length && !loading && !error && (
          <div className="rounded-2xl border border-white/10 p-8">
            <h3 className="font-medium mb-2">Have a request link?</h3>
            <p className="text-sm text-[var(--muted)]">
              Agents create funded requests with the PayHumans CLI and share a
              direct claim link. No sample jobs or simulated balances are
              displayed here.
            </p>
            <a
              href="/docs#quickstart"
              className="inline-block text-[var(--green)] mt-4"
            >
              Create a request →
            </a>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]"
            >
              <div className="flex justify-between mb-5">
                <span className="capitalize text-lg font-medium">
                  {job.platform}
                </span>
                <span className="text-xs text-[var(--muted)]">Base · USDC</span>
              </div>
              <div className="text-3xl font-semibold mb-1">
                {job.available}{" "}
                <span className="text-sm text-[var(--muted)]">
                  USDC available
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] mb-5">
                Send {job.rate} {job.currency} per USDC claimed
              </p>
              <dl className="text-sm space-y-3 mb-6">
                <div>
                  <dt className="text-[var(--muted)]">Recipient</dt>
                  <dd className="break-all">{job.recipient}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Claim range</dt>
                  <dd>
                    {job.min}–{job.max} USDC
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Deposit</dt>
                  <dd>
                    #{job.depositId} · {job.owner.slice(0, 6)}…
                    {job.owner.slice(-4)}
                  </dd>
                </div>
              </dl>
              <button
                onClick={() => setSelected(job)}
                disabled={!job.accepting || !!pendingClaim}
                className="w-full bg-[var(--green)] rounded-xl text-black py-3 font-medium disabled:opacity-40"
              >
                {pendingClaim
                  ? "Recover submitted claim first"
                  : job.accepting
                    ? "Review & claim job"
                    : "Not accepting claims"}
              </button>
            </article>
          ))}
        </div>
        {selected && (
          <ClaimModal
            job={selected}
            onClose={() => {
              const p = new URLSearchParams(window.location.search);
              const pending = p.get("claimTx");
              if (pending) setPendingClaim(pending as Hex);
              const saved = p.get("intent");
              if (saved) setRecoveredIntent(saved);
              setSelected(null);
              void load(id);
            }}
          />
        )}
      </div>
    </section>
  );
}
