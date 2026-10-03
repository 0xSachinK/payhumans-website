const nodes = [
  {
    holder: "Your key",
    title: "Funding wallet",
    sub: "Your crypto, on its own chain",
    tone: "plain",
  },
  {
    holder: "In transit",
    title: "Route",
    sub: "Provider swaps or bridges to USDC on Base",
    tone: "dashed",
  },
  {
    holder: "Your key",
    title: "Your Base account",
    sub: "USDC on Base. It owns the order.",
    tone: "plain",
  },
  {
    holder: "Peer contract",
    title: "Escrow",
    sub: "USDC locked for the order",
    tone: "ink",
  },
] as const;

const hops = ["Source network fee", "Route fee, quoted before you sign", "Base gas for the approval and deposit"];

function Hop({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span className="font-mono text-[10.5px] text-ink-3">{n}</span>
      <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true" className="rotate-90 lg:rotate-0">
        <path d="M0 6h18M13.5 1.5L20 6l-6.5 4.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

/* What `deposit create --yes` does with the agent's funds, and who holds them at each point. */
export default function FundingRouteDiagram() {
  return (
    <figure className="figure" aria-label="How an order is funded and who holds the funds at each step">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-2.5 lg:gap-2">
        {nodes.map((n, i) => (
          <div key={n.title} className="contents">
            <div
              className={`lg:flex-1 lg:min-w-0 rounded-lg px-3.5 py-3 ${
                n.tone === "ink"
                  ? "bg-ink text-paper"
                  : n.tone === "dashed"
                    ? "border border-dashed border-ink-3"
                    : "border-[1.5px] border-ink"
              }`}
            >
              <span className={`block font-mono text-[10px] uppercase tracking-[0.08em] ${n.tone === "ink" ? "opacity-70" : "text-ink-3"}`}>
                {n.holder}
              </span>
              <span className="block mt-1.5 text-[15px] font-semibold leading-tight">{n.title}</span>
              <span className={`block mt-1 text-[12.5px] leading-snug ${n.tone === "ink" ? "opacity-75" : "text-ink-2"}`}>{n.sub}</span>
            </div>
            {i < hops.length ? (
              <div className="flex items-center gap-3 pl-3.5 lg:pl-0">
                <Hop n={i + 1} />
                <span className="lg:hidden font-mono text-[11px] text-ink-3">{hops[i]}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ol className="hidden lg:grid grid-cols-3 gap-4 mt-5">
        {hops.map((h, i) => (
          <li key={h} className="flex gap-2 font-mono !text-[11px] !leading-snug !text-ink-3">
            <span className="text-ink">{i + 1}</span>
            {h}
          </li>
        ))}
      </ol>
      <figcaption>
        <span>Withdrawing sends unclaimed USDC from escrow back to your Base account.</span>
      </figcaption>
    </figure>
  );
}
