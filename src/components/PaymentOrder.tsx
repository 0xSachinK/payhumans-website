import type { CSSProperties } from "react";
import { Mark } from "./brand/Logo";
import { CLI } from "@/lib/constants";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

const endorsements = [
  { label: "Funded", human: false },
  { label: "Claimed", human: true },
  { label: "Fiat sent", human: true },
  { label: "Verified", human: false },
  { label: "Released", human: false },
];

/*
  The hero's thesis: one order, written by a machine and carried out by a person.
  Machine-printed fields are set in mono black; the part a person does is in pen.
  It is an illustration with example values, and says so.
*/
export default function PaymentOrder() {
  return (
    <figure className="slip" aria-label="Example payment order">
      <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <Mark size={15} />
          <span className="label !text-ink">Payment order</span>
        </div>
        <span className="stamp stamp-listed">Example</span>
      </div>
      <div className="guilloche" aria-hidden="true" />

      <dl className="px-5 md:px-6 py-1.5">
        <div className="slip-row anim-print" style={i(1)}>
          <dt className="label">Pay to</dt>
          <dd className="slip-value">
            @recipient
            <span className="slip-note">Named by the agent. Revolut, USD.</span>
          </dd>
        </div>
        <div className="slip-row anim-print" style={i(2)}>
          <dt className="label">Fiat</dt>
          <dd className="slip-value">
            $4.90
            <span className="slip-note">5 USDC at the agent&apos;s rate of 0.98.</span>
          </dd>
        </div>
        <div className="slip-row anim-print" style={i(3)}>
          <dt className="label">In escrow</dt>
          <dd className="slip-value">
            5.00 USDC
            <span className="slip-note">Locked until a payment is verified, then released to whoever paid, less Peer fees.</span>
          </dd>
        </div>
        <div className="slip-row anim-print" style={i(4)}>
          <dt className="label">Funded by</dt>
          <dd className="slip-value">
            <span className="inline-flex items-center gap-2">
              <span className="sq" aria-hidden="true" />
              an agent&apos;s wallet
            </span>
            <span className="slip-note">Supported crypto in. Held as USDC on Base.</span>
          </dd>
        </div>
        <div className="slip-row anim-print" style={i(5)}>
          <dt className="label">Paid by</dt>
          <dd className="slip-value pen">
            <span className="anim-write" style={i(1)}>
              a person, from their own account
            </span>
          </dd>
        </div>
      </dl>

      <div className="px-5 md:px-6 pt-4 pb-5">
        <ol className="endorse" aria-label="Order of events">
          {endorsements.map((e) => (
            <li key={e.label} className={e.human ? "by-human" : undefined}>
              <span className="dot" aria-hidden="true" />
              {e.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="perf" aria-hidden="true" />
      <div className="px-5 md:px-6 py-4 bg-paper-2/60">
        <p className="label mb-1.5">Written with</p>
        <p className="stub">
          {CLI.bin} deposit create --platform revolut --recipient &apos;&lt;revtag&gt;&apos; --amount 5 --currency USD --rate 0.98
        </p>
      </div>
    </figure>
  );
}
