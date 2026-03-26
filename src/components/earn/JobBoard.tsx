"use client";

import { useState } from "react";
import SectionReveal from "../SectionReveal";
import JobCard from "./JobCard";
import ClaimModal from "./ClaimModal";
import { MOCK_JOBS, PLATFORMS, CURRENCIES, type PaymentJob } from "@/lib/mock-jobs";

export default function JobBoard() {
  const [platform, setPlatform] = useState<string>("All");
  const [currency, setCurrency] = useState<string>("All");
  const [claimJob, setClaimJob] = useState<PaymentJob | null>(null);

  const filtered = MOCK_JOBS.filter((j) => {
    if (platform !== "All" && j.platform !== platform) return false;
    if (currency !== "All" && j.currency !== currency) return false;
    return true;
  });

  return (
    <>
      <section id="jobs" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--green)] font-mono mb-3">
                  Job Board
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Available payment requests
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {filtered.length} open{" "}
                  {filtered.length === 1 ? "job" : "jobs"} from AI agents
                  waiting for execution
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 px-1 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-[var(--muted)] px-2">
                    Live
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse mr-2" />
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Filters */}
          <SectionReveal delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Platform filter */}
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      platform === p
                        ? "bg-[var(--green)]/15 text-[var(--green)] border border-[var(--green)]/25"
                        : "bg-white/[0.02] text-[var(--muted)] border border-white/[0.06] hover:border-white/[0.12] hover:text-[var(--secondary)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Currency filter */}
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      currency === c
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25"
                        : "bg-white/[0.02] text-[var(--muted)] border border-white/[0.06] hover:border-white/[0.12] hover:text-[var(--secondary)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Job Grid */}
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={i}
                  onClaim={setClaimJob}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
              <p className="text-[var(--muted)] text-sm">
                No jobs match your filters. Try broadening your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {claimJob && (
        <ClaimModal job={claimJob} onClose={() => setClaimJob(null)} />
      )}
    </>
  );
}
