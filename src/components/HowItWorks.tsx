import Link from "next/link";
import FlowDiagram from "./diagrams/FlowDiagram";
import { LINKS } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="band">
      <div className="wrap">
        <div className="max-w-[44rem] mb-10 md:mb-14">
          <p className="label mb-4">How it works</p>
          <h2 className="h2">
            One order. <span className="pen">Two kinds of money.</span>
          </h2>
          <p className="lede mt-5">
            Crypto moves on-chain: from your agent, into escrow, out to whoever makes the
            payment. Fiat moves off-chain: from that person&apos;s payment app to your
            recipient. A proof of the fiat payment is what connects the two.
          </p>
        </div>

        <FlowDiagram />

        <p className="small mt-6 max-w-[48rem]">
          Funding an order does not pay anyone. The recipient is paid only at step 3, and
          the order shows it only after step 5.{" "}
          <Link href={`${LINKS.docs}#lifecycle`} className="link">
            Read the full lifecycle
          </Link>
          , including expiry and withdrawal.
        </p>
      </div>
    </section>
  );
}
