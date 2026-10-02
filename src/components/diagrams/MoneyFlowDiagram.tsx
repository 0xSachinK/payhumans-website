import { AgentIcon, EscrowIcon, HumanIcon, RecipientIcon } from "./Icons";

const USDC = "#60a5fa";
const FIAT = "#4ade80";
const PROOF = "#c4b5fd";

const nodes = [
  { x: 20, label: "Agent", sub: "holds Solana USDC", Icon: AgentIcon, tint: USDC },
  { x: 290, label: "Escrow", sub: "USDC held by Peer", Icon: EscrowIcon, tint: USDC },
  { x: 560, label: "Human", sub: "has a payment app", Icon: HumanIcon, tint: FIAT },
  { x: 830, label: "Recipient", sub: "wants fiat", Icon: RecipientIcon, tint: FIAT },
];

const W = 150;

function Step({ n, x, y, color }: { n: number; x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill="#0b0b12" stroke={color} strokeWidth={1.5} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill={color} fontFamily="var(--font-geist-mono)">
        {n}
      </text>
    </g>
  );
}

const mobileSteps = [
  { n: 1, color: USDC, from: "Agent", to: "Escrow", what: "locks USDC for a payment to a named recipient" },
  { n: 2, color: FIAT, from: "Human", to: "Recipient", what: "sends fiat from their own payment account" },
  { n: 3, color: PROOF, from: "Human", to: "Escrow", what: "submits a proof of that payment" },
  { n: 4, color: USDC, from: "Escrow", to: "Human", what: "releases USDC once the proof checks out" },
];

export default function MoneyFlowDiagram({ className = "" }: { className?: string }) {
  return (
    <figure className={`diagram-frame ${className}`}>
      <svg
        viewBox="0 0 1000 300"
        className="hidden md:block w-full h-auto"
        role="img"
        aria-labelledby="mf-title mf-desc"
      >
        <title id="mf-title">How money moves through PayHumans</title>
        <desc id="mf-desc">
          The agent escrows USDC. A human pays the recipient in fiat, proves the payment, and the escrow releases USDC to the human.
        </desc>
        <defs>
          {[["usdc", USDC], ["fiat", FIAT], ["proof", PROOF]].map(([id, c]) => (
            <marker key={id} id={`mf-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* 1. Agent -> Escrow */}
        <line x1={170} y1={150} x2={286} y2={150} stroke={USDC} strokeWidth={2} markerEnd="url(#mf-usdc)" className="flow-dash" />
        <Step n={1} x={228} y={122} color={USDC} />
        <text x={228} y={184} textAnchor="middle" className="dg-label" fill={USDC}>USDC in</text>

        {/* 4. Escrow -> Human (top) */}
        <line x1={440} y1={128} x2={556} y2={128} stroke={USDC} strokeWidth={2} markerEnd="url(#mf-usdc)" className="flow-dash" />
        <Step n={4} x={498} y={100} color={USDC} />
        {/* 3. Human -> Escrow (bottom, proof) */}
        <line x1={556} y1={174} x2={444} y2={174} stroke={PROOF} strokeWidth={1.75} strokeDasharray="5 5" markerEnd="url(#mf-proof)" />
        <Step n={3} x={498} y={202} color={PROOF} />
        <text x={498} y={238} textAnchor="middle" className="dg-label" fill={PROOF}>proof of payment</text>
        <text x={498} y={70} textAnchor="middle" className="dg-label" fill={USDC}>USDC out (incl. reward)</text>

        {/* 2. Human -> Recipient */}
        <line x1={710} y1={150} x2={826} y2={150} stroke={FIAT} strokeWidth={2} markerEnd="url(#mf-fiat)" className="flow-dash" />
        <Step n={2} x={768} y={122} color={FIAT} />
        <text x={768} y={184} textAnchor="middle" className="dg-label" fill={FIAT}>fiat</text>

        {nodes.map(({ x, label, sub, Icon, tint }) => (
          <g key={label}>
            <rect x={x} y={90} width={W} height={120} rx={16} fill="#0c0c14" stroke="rgba(255,255,255,0.1)" />
            <rect x={x} y={90} width={W} height={3} rx={1.5} fill={tint} opacity={0.7} />
            <Icon x={x + W / 2 - 13} y={110} size={26} color={tint} />
            <text x={x + W / 2} y={162} textAnchor="middle" fontSize={16} fontWeight={600} fill="#f4f4f5">
              {label}
            </text>
            <text x={x + W / 2} y={184} textAnchor="middle" fontSize={12} fill="#a1a1aa">
              {sub}
            </text>
          </g>
        ))}

        {/* onchain boundary around escrow */}
        <rect x={278} y={78} width={174} height={144} rx={22} fill="none" stroke="rgba(96,165,250,0.25)" strokeDasharray="3 6" />
        <text x={365} y={258} textAnchor="middle" className="dg-label" fill="#71717a">onchain · Peer escrow</text>
        <text x={768} y={258} textAnchor="middle" className="dg-label" fill="#71717a">offchain · payment app</text>
      </svg>

      <ol className="md:hidden space-y-3">
        {mobileSteps.map((s) => (
          <li key={s.n} className="flex gap-3 items-start">
            <span
              className="mt-0.5 w-6 h-6 shrink-0 rounded-full border text-[11px] font-mono font-semibold flex items-center justify-center"
              style={{ color: s.color, borderColor: s.color }}
            >
              {s.n}
            </span>
            <p className="text-sm text-[var(--secondary)] leading-relaxed">
              <span className="text-[var(--fg)] font-medium">{s.from}</span>
              <span className="mx-1.5" style={{ color: s.color }}>&rarr;</span>
              <span className="text-[var(--fg)] font-medium">{s.to}</span>
              <span className="block">{s.what}</span>
            </p>
          </li>
        ))}
      </ol>

      <figcaption className="dg-legend">
        <span><i style={{ background: USDC }} /> USDC</span>
        <span><i style={{ background: FIAT }} /> Fiat</span>
        <span><i style={{ background: PROOF }} /> Proof</span>
      </figcaption>
    </figure>
  );
}
