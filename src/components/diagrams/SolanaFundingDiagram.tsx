import { AgentIcon, EscrowIcon, HumanIcon, RecipientIcon } from "./Icons";

const SOL = "#c084fc";
const USDC = "#60a5fa";
const FIAT = "#4ade80";
const PLANNED = "#71717a";

function BridgeIcon({ x, y, size = 24, color }: { x: number; y: number; size?: number; color: string }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17h18M5 17v-4a7 7 0 0 1 14 0v4M9 17v-3M15 17v-3" />
    </svg>
  );
}

const NW = 150;

const nodes = [
  { cx: 110, label: "Solana wallet", sub: "USDC or SOL", color: SOL, kind: "sol", planned: true },
  { cx: 300, label: "Peer + Relay", sub: "bridge to Base USDC", color: SOL, kind: "bridge", planned: true },
  { cx: 520, label: "Peer escrow", sub: "agent's USDC on Base", color: USDC, kind: "escrow", planned: false },
  { cx: 730, label: "Human", sub: "claims, pays, proves", color: FIAT, kind: "human", planned: false },
  { cx: 905, label: "Recipient", sub: "gets fiat", color: FIAT, kind: "recipient", planned: false },
] as const;

const mobile = [
  { planned: true, color: SOL, title: "Planned: fund from Solana", body: "Solana USDC or SOL bridged to Base USDC through a future Peer + Relay integration. Not available yet." },
  { planned: false, color: USDC, title: "Live: escrow on Base", body: "The agent creates a Peer escrow deposit with USDC it holds on Base." },
  { planned: false, color: FIAT, title: "Live: human pays fiat", body: "A human claims, pays the recipient, proves it, and receives USDC on Base." },
];

export default function SolanaFundingDiagram({ className = "" }: { className?: string }) {
  return (
    <figure className={`diagram-frame ${className}`}>
      <svg viewBox="0 0 1000 300" className="hidden md:block w-full h-auto" role="img" aria-labelledby="sf-title sf-desc">
        <title id="sf-title">Planned Solana funding and the current Base workflow</title>
        <desc id="sf-desc">
          Planned, not live: a Solana wallet funds through a future Peer and Relay integration into USDC on Base. Live today: the agent escrows USDC on Base with Peer, and a human pays the recipient in fiat, proves it, and receives USDC on Base.
        </desc>
        <defs>
          {[["usdc", USDC], ["fiat", FIAT], ["planned", SOL]].map(([id, c]) => (
            <marker key={id} id={`sf-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* Planned zone */}
        <rect x={10} y={20} width={390} height={260} rx={18} fill="none" stroke={`${SOL}55`} strokeDasharray="6 6" />
        <text x={26} y={46} fontSize={13} fontWeight={600} fill={SOL}>Planned</text>
        <text x={26} y={64} className="dg-label" fill={PLANNED}>Solana funding · not live</text>

        {/* Live zone */}
        <rect x={420} y={20} width={570} height={260} rx={18} fill={`${USDC}08`} stroke={`${USDC}45`} />
        <text x={436} y={46} fontSize={13} fontWeight={600} fill={USDC}>Live today</text>
        <text x={436} y={64} className="dg-label" fill={PLANNED}>Base escrow + offchain payment</text>

        {/* planned arrows */}
        <line x1={187} y1={170} x2={221} y2={170} stroke={SOL} strokeOpacity={0.7} strokeWidth={1.75} strokeDasharray="4 5" markerEnd="url(#sf-planned)" />
        <line x1={377} y1={170} x2={441} y2={170} stroke={SOL} strokeOpacity={0.7} strokeWidth={1.75} strokeDasharray="4 5" markerEnd="url(#sf-planned)" />

        {/* live arrows */}
        <line x1={655} y1={156} x2={599} y2={156} stroke="#c4b5fd" strokeWidth={1.5} strokeDasharray="4 4" markerEnd="url(#sf-usdc)" />
        <line x1={597} y1={186} x2={653} y2={186} stroke={USDC} strokeWidth={2} markerEnd="url(#sf-usdc)" />
        <line x1={807} y1={170} x2={828} y2={170} stroke={FIAT} strokeWidth={2} markerEnd="url(#sf-fiat)" />
        <text x={626} y={146} textAnchor="middle" className="dg-label" fill="#c4b5fd">proof</text>
        <text x={626} y={206} textAnchor="middle" className="dg-label" fill={USDC}>USDC</text>
        <text x={818} y={198} textAnchor="middle" className="dg-label" fill={FIAT}>fiat</text>

        {nodes.map((n) => {
          const x = n.cx - NW / 2;
          const iconX = n.cx - 12;
          const color = n.color;
          return (
            <g key={n.label} opacity={n.planned ? 0.75 : 1}>
              <rect
                x={x}
                y={110}
                width={NW}
                height={120}
                rx={14}
                fill="#0c0c14"
                stroke={n.planned ? `${SOL}66` : "rgba(255,255,255,0.12)"}
                strokeDasharray={n.planned ? "5 5" : undefined}
              />
              {n.kind === "sol" ? <AgentIcon x={iconX} y={126} size={24} color={color} /> : null}
              {n.kind === "bridge" ? <BridgeIcon x={iconX} y={126} color={color} /> : null}
              {n.kind === "escrow" ? <EscrowIcon x={iconX} y={126} size={24} color={color} /> : null}
              {n.kind === "human" ? <HumanIcon x={iconX} y={126} size={24} color={color} /> : null}
              {n.kind === "recipient" ? <RecipientIcon x={iconX} y={126} size={24} color={color} /> : null}
              <text x={n.cx} y={178} textAnchor="middle" fontSize={14} fontWeight={600} fill="#f4f4f5">{n.label}</text>
              <text x={n.cx} y={198} textAnchor="middle" fontSize={11} fill="#a1a1aa">{n.sub}</text>
            </g>
          );
        })}

        <text x={205} y={262} textAnchor="middle" className="dg-label" fill={PLANNED}>would also need SOL for fees</text>
        <text x={705} y={262} textAnchor="middle" className="dg-label" fill={PLANNED}>agent needs Base USDC + ETH for gas</text>
      </svg>

      <ol className="md:hidden space-y-3">
        {mobile.map((s, i) => (
          <li key={s.title} className={`flex gap-3 items-start ${s.planned ? "opacity-80" : ""}`}>
            <span
              className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border text-[11px] font-mono font-semibold flex items-center justify-center ${s.planned ? "border-dashed" : ""}`}
              style={{ color: s.color, borderColor: s.color }}
            >
              {i + 1}
            </span>
            <p className="text-sm text-[var(--secondary)] leading-relaxed">
              <span className="block text-[var(--fg)] font-medium">{s.title}</span>
              {s.body}
            </p>
          </li>
        ))}
      </ol>

      <figcaption className="dg-legend">
        <span><i style={{ background: "transparent", borderTop: `2px dashed ${SOL}` }} /> Planned, not live</span>
        <span><i style={{ background: USDC }} /> USDC on Base (live)</span>
        <span><i style={{ background: FIAT }} /> Fiat (live)</span>
        <span>No Solana escrow program; settlement stays on Base</span>
      </figcaption>
    </figure>
  );
}
