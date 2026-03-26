"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { PaymentJob } from "@/lib/mock-jobs";

type Step = "connect" | "claim" | "send" | "prove" | "complete";

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih";

export default function ClaimModal({
  job,
  onClose,
}: {
  job: PaymentJob;
  onClose: () => void;
}) {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<Step>(isConnected ? "claim" : "connect");

  useEffect(() => {
    if (isConnected && step === "connect") setStep("claim");
  }, [isConnected, step]);

  // Lock scroll + Escape to close
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const stepConfig: Record<Step, { label: string; index: number }> = {
    connect: { label: "Connect", index: 0 },
    claim: { label: "Claim", index: 1 },
    send: { label: "Send Fiat", index: 2 },
    prove: { label: "Prove", index: 3 },
    complete: { label: "Done", index: 4 },
  };

  const allSteps: Step[] = ["connect", "claim", "send", "prove", "complete"];
  const currentIndex = stepConfig[step].index;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Claim payment job"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0a0a0f] shadow-2xl overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] transition-colors z-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Green top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--green)]/40 to-transparent" />

          <div className="p-6 md:p-8">
            {/* Step indicators */}
            <div className="flex items-center gap-1 mb-8">
              {allSteps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= currentIndex
                        ? "bg-[var(--green)]"
                        : "bg-white/[0.06]"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Job summary */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6">
              <div className="flex-1">
                <div className="text-xs text-[var(--muted)] mb-1">
                  {job.platform} &middot; {job.currency}
                </div>
                <div className="text-lg font-bold font-mono">
                  {job.amount}{" "}
                  <span className="text-sm font-normal text-[var(--muted)]">
                    USDC
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted)] mb-1">
                  You earn
                </div>
                <div className="text-lg font-bold font-mono text-[var(--green)]">
                  {job.earnings}
                </div>
              </div>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === "connect" && (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Connect your wallet
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                      You need a wallet on Base to claim jobs and receive USDC.
                    </p>
                    <ConnectButton />
                  </div>
                )}

                {step === "claim" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Claim this payment job
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                      Signing this transaction locks the USDC in escrow for you.
                      You&apos;ll have 30 minutes to complete the payment.
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)]">Send via</span>
                        <span className="font-medium">{job.platform}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)]">Amount</span>
                        <span className="font-mono">
                          {job.fiatAmount} {job.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted)]">You receive</span>
                        <span className="font-mono text-[var(--green)]">
                          {job.amount} USDC
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("send")}
                      className="w-full py-3 rounded-lg bg-[var(--green)] text-[#050505] font-semibold text-sm hover:bg-[#16a34a] transition-all"
                    >
                      Sign & Claim Job
                    </button>
                  </div>
                )}

                {step === "send" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Send the payment
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                      Open {job.platform} and send the exact amount to the
                      recipient below.
                    </p>

                    <div className="p-4 rounded-xl bg-[var(--green)]/[0.04] border border-[var(--green)]/15 mb-6">
                      <div className="text-center">
                        <div className="text-xs text-[var(--muted)] mb-2 uppercase tracking-wider">
                          Send exactly
                        </div>
                        <div className="text-3xl font-bold font-mono text-[var(--green)] mb-1">
                          {job.fiatAmount} {job.currency}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          via {job.platform}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--amber)]/[0.06] border border-[var(--amber)]/15 text-xs text-[var(--amber)] mb-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
                        <path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      Send the exact amount. Mismatched amounts will fail
                      verification.
                    </div>

                    <button
                      onClick={() => setStep("prove")}
                      className="w-full py-3 rounded-lg bg-[var(--green)] text-[#050505] font-semibold text-sm hover:bg-[#16a34a] transition-all"
                    >
                      I&apos;ve sent the payment
                    </button>
                  </div>
                )}

                {step === "prove" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Prove your payment
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                      Click below to open PeerAuth. The extension will capture a
                      TLS attestation proof of your payment.
                    </p>

                    <button
                      onClick={() => setStep("complete")}
                      className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[#2563eb] transition-all mb-4"
                    >
                      Open PeerAuth Extension
                    </button>

                    <a
                      href={EXTENSION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-xs text-[var(--muted)] hover:text-[var(--secondary)] transition-colors"
                    >
                      Don&apos;t have PeerAuth?{" "}
                      <span className="underline">Install it here</span>
                    </a>
                  </div>
                )}

                {step === "complete" && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--green)]/15 border border-[var(--green)]/25 flex items-center justify-center mx-auto mb-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.5} className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Payment verified!
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-2">
                      Your TLS attestation proof was submitted and verified.
                    </p>
                    <div className="text-2xl font-bold font-mono text-[var(--green)] mb-6">
                      +{job.amount} USDC
                    </div>
                    <button
                      onClick={onClose}
                      className="px-8 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm font-medium hover:bg-white/[0.06] transition-all"
                    >
                      Back to Jobs
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
