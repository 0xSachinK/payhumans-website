import { BALANCES } from "@/lib/constants";

const example = [
  { key: "fulfilled", amount: 4, className: "bar-paid" },
  { key: "reserved", amount: 5, className: "bar-reserved" },
  { key: "available", amount: 9, className: "bar-available" },
  { key: "withdrawn", amount: 2, className: "bar-withdrawn" },
];

const swatch: Record<string, string> = {
  funded: "border border-ink bg-paper-2",
  available: "border border-ink bg-card",
  reserved: "border border-pen bar-reserved !border-pen",
  fulfilled: "bg-pen",
  withdrawn: "border border-ink bg-paper-3",
};

/* One order, part-way through: several people can fill it in pieces. */
export default function BalanceDiagram() {
  const total = example.reduce((sum, e) => sum + e.amount, 0);
  return (
    <figure className="figure" aria-label="Example balances of a 20 USDC order that has been partly filled">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <span className="label !text-ink">Example order</span>
        <span className="font-mono text-[12px] text-ink-3">{total} USDC funded, claims of 1 to 5 USDC</span>
      </div>
      <div className="bar" role="img" aria-label="4 USDC fulfilled, 5 reserved, 9 available, 2 withdrawn">
        {example.map((e) => (
          <div key={e.key} className={e.className} style={{ width: `${(e.amount / total) * 100}%` }}>
            {e.amount}
          </div>
        ))}
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-6">
        {BALANCES.map((b) => (
          <div key={b.key} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
            <span className={`mt-[5px] w-3.5 h-3.5 rounded-[3px] ${swatch[b.key]}`} aria-hidden="true" />
            <div>
              <dt className="text-[14.5px] font-semibold">
                {b.name} <code className="font-mono text-[12px] font-normal text-ink-3 ml-1">{b.key}</code>
              </dt>
              <dd className="text-[13.5px] leading-normal text-ink-2 mt-0.5">{b.meaning}</dd>
            </div>
          </div>
        ))}
      </dl>
      <figcaption>
        <span>funded = available + reserved + fulfilled + withdrawn</span>
      </figcaption>
    </figure>
  );
}
