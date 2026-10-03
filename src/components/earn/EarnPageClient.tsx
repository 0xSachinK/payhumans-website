"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import Footer from "@/components/Footer";
import { LINKS } from "@/lib/constants";
const Web3Provider = dynamic(() => import("@/providers/Web3Provider"), {
  ssr: false,
});
const EarnNavigation = dynamic(() => import("./EarnNavigation"), {
  ssr: false,
});
const JobBoard = dynamic(() => import("./JobBoard"), { ssr: false });

/*
  The browser claim flow. New orders are filled in the Peer app (see /earn);
  this page stays so that claim links issued by the CLI, and claims already
  made here, can always be looked up, verified or cancelled.
*/
export default function EarnPageClient() {
  return (
    <div className="theme-ink flex-1 flex flex-col">
      <Web3Provider>
        <EarnNavigation />
        <main className="pt-28 flex-1">
          <header className="px-6 pt-8 pb-4">
            <div className="max-w-5xl mx-auto">
            <p className="label mb-5 flex items-center gap-2.5">
              <span className="ci" aria-hidden="true" />
              Claim page
            </p>
            <h1 className="text-[clamp(2.125rem,5vw,3.5rem)] font-medium tracking-[-0.04em] leading-[1.04] mb-6">
              Look up an order.
              <span className="pen block text-[1.1em] leading-none mt-1">Recover a claim.</span>
            </h1>
            <p className="max-w-2xl text-[var(--secondary)] text-[1.0625rem] leading-relaxed">
              Enter a deposit ID to see an order&apos;s live terms, read from its
              escrow. Claims made in this browser flow can be reopened here,
              verified or cancelled.
            </p>
            <div className="note mt-7 max-w-2xl">
              <span className="label !text-[var(--fg)] pt-[3px]">New here?</span>
              <p>
                Orders are easiest to fill in the Peer mobile app.{" "}
                <Link href={LINKS.earn} className="link">
                  See how
                </Link>
                . This page keeps the browser flow working for links issued by the
                CLI and for claims already made here.
              </p>
            </div>
            </div>
          </header>
          <JobBoard />
        </main>
        <Footer />
      </Web3Provider>
    </div>
  );
}
