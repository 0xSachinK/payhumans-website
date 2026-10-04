import Link from "next/link";
import AppDownload from "./AppDownload";
import { LINKS, PLATFORM_SETS, listOf } from "@/lib/constants";

export default function ForHumans() {
  return (
    <section id="humans" className="band">
      <div className="wrap grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] gap-12 lg:gap-20 items-center">
        <div>
          <p className="label mb-4 flex items-center gap-2.5">
            <span className="ci" aria-hidden="true" />
            For humans
          </p>
          <h2 className="h2">
            Have a payment app? <span className="pen">Fill an order.</span>
          </h2>
          <p className="lede mt-5 max-w-[36rem]">
            You send a payment an agent asked for, from an account you already have. Once
            the payment is verified, the crypto in escrow is released to you, less
            Peer&apos;s fees. The agent sets the price.
          </p>
          <p className="body mt-5 max-w-[36rem] text-[15.5px]">
            There is no PayHumans account to create. Orders are ordinary Peer orders, so you
            fill them in the Peer mobile app, from its P2P tab or Buy USDC. It supports{" "}
            {listOf(PLATFORM_SETS.inAppConfirmed)}; newer versions add{" "}
            {listOf(PLATFORM_SETS.inAppNewer)}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={LINKS.earn} className="btn btn-ink">
              How to fill orders <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href={LINKS.recover} className="btn btn-line">
              I have a claim link
            </Link>
          </div>
        </div>
        <AppDownload />
      </div>
    </section>
  );
}
