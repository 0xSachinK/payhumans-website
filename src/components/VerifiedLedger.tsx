import { VERIFICATION } from "@/lib/constants";

/* Says plainly what has been proven with real funds and what has not. */
export default function VerifiedLedger({ heading = true }: { heading?: boolean }) {
  return (
    <div>
      {heading ? (
        <div className="max-w-[44rem] mb-10">
          <p className="label mb-4">Status as of {VERIFICATION.asOf}</p>
          <h2 className="h2">What has been proven, and what has not.</h2>
          <p className="lede mt-5">
            PayHumans is new. This is the line between what has run with real funds and
            what is still untested. Start with small amounts.
          </p>
        </div>
      ) : null}
      <div className="grid md:grid-cols-2 gap-px bg-rule border border-rule rounded-xl overflow-hidden">
        <div className="bg-card p-6 md:p-8">
          <h3 className="label !text-ink flex items-center gap-2.5 mb-5">
            <span className="sq" aria-hidden="true" />
            Run on mainnet with real funds
          </h3>
          <ul className="grid gap-4">
            {VERIFICATION.verified.map((v) => (
              <li key={v} className="text-[15px] leading-[1.55] text-ink-2 pl-4 border-l-2 border-ink">
                {v}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card p-6 md:p-8">
          <h3 className="label flex items-center gap-2.5 mb-5">
            <span className="inline-block w-[0.62em] h-[0.62em] border border-ink-3 rounded-[1.5px]" aria-hidden="true" />
            Not yet verified
          </h3>
          <ul className="grid gap-4">
            {VERIFICATION.unverified.map((v) => (
              <li key={v} className="text-[15px] leading-[1.55] text-ink-2 pl-4 border-l-2 border-dashed border-rule-strong">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
