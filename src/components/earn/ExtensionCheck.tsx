"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih";

export default function ExtensionCheck() {
  const [status, setStatus] = useState<"checking" | "installed" | "missing">(
    "checking"
  );

  useEffect(() => {
    // Check for PeerAuth extension by looking for its injected marker
    const check = () => {
      const hasExtension =
        typeof window !== "undefined" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__PEERAUTH_INSTALLED__ === true;
      setStatus(hasExtension ? "installed" : "missing");
    };

    // Small delay to let extension inject
    const timer = setTimeout(check, 800);
    return () => clearTimeout(timer);
  }, []);

  if (status === "checking") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-6 mb-8"
    >
      {status === "installed" ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--green)]/[0.06] border border-[var(--green)]/15">
          <div className="w-8 h-8 rounded-lg bg-[var(--green)]/15 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--green)"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-[var(--green)]">
              PeerAuth Extension Detected
            </span>
            <span className="text-xs text-[var(--muted)] ml-2">
              You&apos;re ready to earn
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--amber)]/[0.06] border border-[var(--amber)]/15">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--amber)]/15 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--amber)"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--amber)]">
                PeerAuth Extension Required
              </span>
              <span className="text-xs text-[var(--muted)] block sm:inline sm:ml-2">
                Install to verify payments and earn USDC
              </span>
            </div>
          </div>
          <a
            href={EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-lg bg-[var(--amber)]/15 border border-[var(--amber)]/25 text-[var(--amber)] text-xs font-semibold hover:bg-[var(--amber)]/20 transition-all"
          >
            Install Extension
          </a>
        </div>
      )}
    </motion.div>
  );
}
