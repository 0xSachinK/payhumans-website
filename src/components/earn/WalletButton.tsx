"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useState } from "react";
export default function WalletButton() {
  const { ready, authenticated, login, logout, linkPasskey } = usePrivy();
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <button
        disabled={!ready || (authenticated && !address)}
        onClick={() =>
          authenticated
            ? setOpen(!open)
            : login({ loginMethods: ["passkey", "email"] })
        }
        className="rounded-lg bg-[var(--green)] text-black px-4 py-2 text-sm font-medium disabled:opacity-50"
        aria-expanded={authenticated ? open : undefined}
      >
        {!ready
          ? "Loading…"
          : authenticated
            ? address
              ? `${address.slice(0, 6)}…${address.slice(-4)}`
              : "Creating wallet…"
            : "Sign in"}
      </button>
      {open && address && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[#151817] border border-white/15 rounded-xl p-4 w-64 shadow-xl">
          <p className="text-xs text-[var(--muted)] mb-2">Your PayHumans wallet</p>
          <code className="text-xs break-all block">{address}</code>
          <button
            className="text-sm underline my-3 block"
            onClick={() =>
              void navigator.clipboard
                .writeText(address)
                .then(() => setCopied(true))
            }
          >
            {copied ? "Copied" : "Copy address"}
          </button>
          <a
            className="text-sm underline block mb-3"
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noreferrer"
          >
            View wallet ↗
          </a>
          <button
            className="text-sm underline block mb-3"
            onClick={() => {
              setOpen(false);
              linkPasskey({ name: "PayHumans" });
            }}
          >
            Add a passkey
          </button>
          <button
            className="text-sm text-[var(--muted)]"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
