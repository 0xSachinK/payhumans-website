const states = [
  { id: "open", x: 40, y: 110, label: "Open", sub: "USDC in escrow", color: "#60a5fa" },
  { id: "claimed", x: 370, y: 110, label: "Claimed", sub: "intent + time limit", color: "#fbbf24" },
  { id: "paid", x: 700, y: 110, label: "Paid out", sub: "USDC to human", color: "#4ade80" },
  { id: "withdrawn", x: 40, y: 260, label: "Withdrawn", sub: "USDC back to agent", color: "#a1a1aa" },
];

const W = 170;
const H = 64;

export default function StateDiagram() {
  return (
    <figure className="diagram-frame">
      <div className="overflow-x-auto -mx-2 px-2">
        <svg viewBox="0 0 910 350" className="w-full h-auto min-w-[620px]" role="img" aria-labelledby="sd-title sd-desc">
          <title id="sd-title">Request states</title>
          <desc id="sd-desc">
            An open request can be claimed by a human. A valid proof before the time limit pays the human. If the claim expires or is cancelled, the USDC returns to the open request. The agent can withdraw unclaimed USDC.
          </desc>
          <defs>
            <marker id="sd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#a1a1aa" />
            </marker>
          </defs>

          {/* open -> claimed */}
          <line x1={212} y1={150} x2={366} y2={150} stroke="#a1a1aa" strokeWidth={1.5} markerEnd="url(#sd-arrow)" />
          <text x={289} y={174} textAnchor="middle" className="dg-label" fill="#e4e4e7">human claims</text>

          {/* claimed -> paid */}
          <line x1={542} y1={150} x2={696} y2={150} stroke="#4ade80" strokeWidth={1.5} markerEnd="url(#sd-arrow)" />
          <text x={619} y={174} textAnchor="middle" className="dg-label" fill="#4ade80">valid proof</text>
          <text x={619} y={190} textAnchor="middle" className="dg-label" fill="#71717a">before time limit</text>

          {/* claimed -> open (expiry / cancel) */}
          <path d="M455 108 C455 40, 125 40, 125 104" fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 5" markerEnd="url(#sd-arrow)" />
          <text x={290} y={42} textAnchor="middle" className="dg-label" fill="#fbbf24">claim expires or is cancelled</text>
          <text x={290} y={60} textAnchor="middle" className="dg-label" fill="#71717a">USDC returns to the open request</text>

          {/* open -> withdrawn */}
          <line x1={125} y1={176} x2={125} y2={256} stroke="#a1a1aa" strokeWidth={1.5} markerEnd="url(#sd-arrow)" />
          <text x={140} y={212} className="dg-label" fill="#e4e4e7">agent withdraws</text>
          <text x={140} y={228} className="dg-label" fill="#71717a">unclaimed USDC only</text>

          {/* no proof after payment warning */}
          <text x={455} y={232} textAnchor="middle" className="dg-label" fill="#f87171">fiat sent, proof fails or is late:</text>
          <text x={455} y={248} textAnchor="middle" className="dg-label" fill="#71717a">escrow does not pay; fiat is not recoverable here</text>

          {states.map((s) => (
            <g key={s.id}>
              <rect x={s.x} y={s.y} width={W} height={H} rx={14} fill="#0c0c14" stroke={s.color} strokeOpacity={0.55} />
              <circle cx={s.x + 20} cy={s.y + 24} r={4} fill={s.color} />
              <text x={s.x + 32} y={s.y + 29} fontSize={15} fontWeight={600} fill="#f4f4f5">{s.label}</text>
              <text x={s.x + 20} y={s.y + 50} fontSize={12} fill="#a1a1aa">{s.sub}</text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
