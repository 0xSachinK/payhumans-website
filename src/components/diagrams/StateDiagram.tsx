const W = 176;
const H = 68;

const states = [
  { id: "available", x: 36, y: 110, label: "Available", sub: "USDC open to claim", human: false },
  { id: "reserved", x: 366, y: 110, label: "Reserved", sub: "claimed, clock running", human: true },
  { id: "fulfilled", x: 696, y: 110, label: "Fulfilled", sub: "USDC released to payer", human: false },
  { id: "withdrawn", x: 36, y: 262, label: "Withdrawn", sub: "USDC back with the agent", human: false },
];

/* What can happen to the USDC in an order. Blue transitions are a person's doing. */
export default function StateDiagram() {
  return (
    <figure className="figure">
      <div className="overflow-x-auto -mx-1 px-1">
        <svg viewBox="0 0 908 350" className="w-full h-auto min-w-[640px]" role="img" aria-labelledby="sd-title sd-desc">
          <title id="sd-title">States of the USDC in an order</title>
          <desc id="sd-desc">
            Available USDC becomes reserved when a person claims it. A valid payment proof before the claim expires
            releases it to that person. If the claim expires or is cancelled, the USDC becomes available again. The
            agent can withdraw available USDC at any time.
          </desc>
          <defs>
            <marker id="sd-ink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0.5L9 5L0 9.5z" fill="var(--ink)" />
            </marker>
            <marker id="sd-pen" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0.5L9 5L0 9.5z" fill="var(--pen)" />
            </marker>
            <marker id="sd-muted" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0.5L9 5L0 9.5z" fill="var(--ink-3)" />
            </marker>
          </defs>

          {/* available -> reserved */}
          <line x1={214} y1={144} x2={360} y2={144} stroke="var(--pen)" strokeWidth={1.75} markerEnd="url(#sd-pen)" />
          <text x={287} y={134} textAnchor="middle" fontSize={15} className="dg-pen">a person claims</text>

          {/* reserved -> fulfilled */}
          <line x1={544} y1={144} x2={690} y2={144} stroke="var(--pen)" strokeWidth={1.75} markerEnd="url(#sd-pen)" />
          <text x={617} y={134} textAnchor="middle" fontSize={15} className="dg-pen">pays and proves</text>
          <text x={617} y={166} textAnchor="middle" fontSize={11} className="dg-m">before the claim expires</text>

          {/* reserved -> available */}
          <path d="M454 106 C454 36, 124 36, 124 104" fill="none" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="5 5" markerEnd="url(#sd-muted)" />
          <text x={289} y={38} textAnchor="middle" fontSize={12} fontWeight={500} className="dg-t">claim expires or is cancelled</text>
          <text x={289} y={56} textAnchor="middle" fontSize={11} className="dg-m">nothing is paid out</text>

          {/* available -> withdrawn */}
          <line x1={124} y1={180} x2={124} y2={256} stroke="var(--ink)" strokeWidth={1.75} markerEnd="url(#sd-ink)" />
          <text x={140} y={214} fontSize={12} fontWeight={500} className="dg-t">agent withdraws</text>
          <text x={140} y={231} fontSize={11} className="dg-m">available USDC only</text>

          <text x={454} y={232} textAnchor="middle" fontSize={12} fontWeight={500} fill="var(--warn)" className="font-sans">
            Fiat sent, but the proof fails or is late:
          </text>
          <text x={454} y={250} textAnchor="middle" fontSize={11} className="dg-m">
            the escrow does not pay, and the fiat is not recoverable here
          </text>

          {states.map((s) => (
            <g key={s.id}>
              <rect
                x={s.x}
                y={s.y}
                width={W}
                height={H}
                rx={s.human ? H / 2 : 9}
                fill={s.id === "fulfilled" ? "var(--ink)" : "var(--card)"}
                stroke={s.human ? "var(--pen)" : "var(--ink)"}
                strokeWidth={1.5}
              />
              <text
                x={s.x + W / 2}
                y={s.y + 30}
                textAnchor="middle"
                fontSize={15.5}
                fontWeight={600}
                fill={s.id === "fulfilled" ? "var(--paper)" : s.human ? "var(--pen)" : "var(--ink)"}
                className="font-sans"
              >
                {s.label}
              </text>
              <text
                x={s.x + W / 2}
                y={s.y + 49}
                textAnchor="middle"
                fontSize={11}
                fill={s.id === "fulfilled" ? "var(--paper)" : "var(--ink-3)"}
                opacity={s.id === "fulfilled" ? 0.75 : 1}
                className="font-mono"
              >
                {s.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
