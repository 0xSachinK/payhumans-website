import { AgentIcon, EscrowIcon, HumanIcon, RecipientIcon } from "./Icons";

const SOL = "#c084fc";
const USDC = "#60a5fa";
const FIAT = "#4ade80";
const MUTED = "#71717a";

const NW = 170;

const nodes = [
  { cx: 120, label: "Agent", sub: "Solana wallet · USDC", color: SOL, kind: "agent" },
  { cx: 380, label: "Peer escrow", sub: "holds the agent's USDC", color: USDC, kind: "escrow" },
  { cx: 640, label: "Human", sub: "claims, pays, proves", color: FIAT, kind: "human" },
  { cx: 880, label: "Recipient", sub: "gets fiat", color: FIAT, kind: "recipient" },
] as const;

const mobile = [
  { color: SOL, title: "Agent funds with Solana USDC", body: "The agent escrows USDC from its Solana wallet for a fiat payment to a named recipient." },
  { color: USDC, title: "Peer holds the USDC", body: "The escrow locks the USDC with the recipient, platform, amount, and rate." },
  { color: FIAT, title: "Human pays fiat, gets USDC", body: "A human claims the request, pays the recipient from their own app, proves it, and receives the USDC." },
];

export default function SolanaFundingDiagram({ className = "" }: { className?: string }) {
  return (
    <figure className={`diagram-frame ${className}`}>
      <svg viewBox="0 0 1000 300" className="hidden md:block w-full h-auto" role="img" aria-labelledby="sf-title sf-desc">
        <title id="sf-title">How a Solana agent pays a human</title>
        <desc id="sf-desc">
          An agent funds a request with USDC from its Solana wallet. Peer escrow holds the USDC. A human claims the request, pays the recipient in fiat, proves the payment, and receives the USDC.
        </desc>
        <defs>
          {[["usdc", USDC], ["fiat", FIAT], ["sol", SOL], ["proof", "#c4b5fd"]].map(([id, c]) => (
            <marker key={id} id={`sf-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill={c} />
            </marker>
          ))}
        </defs>

        <rect x={10} y={20} width={980} height={260} rx={18} fill={`${SOL}06`} stroke={`${SOL}40`} />
        <text x={28} y={48} fontSize={13} fontWeight={600} fill={SOL}>Solana USDC in · fiat out</text>
        <text x={28} y={66} className="dg-label" fill={MUTED}>escrow and payment verification by Peer</text>

        {/* agent -> escrow */}
        <line x1={207} y1={160} x2={291} y2={160} stroke={SOL} strokeWidth={2} markerEnd="url(#sf-sol)" />
        <text x={249} y={148} textAnchor="middle" className="dg-label" fill={SOL}>USDC</text>

        {/* human -> escrow (proof), escrow -> human (USDC) */}
        <line x1={553} y1={146} x2={469} y2={146} stroke="#c4b5fd" strokeWidth={1.5} strokeDasharray="4 4" markerEnd="url(#sf-proof)" />
        <line x1={467} y1={176} x2={551} y2={176} stroke={USDC} strokeWidth={2} markerEnd="url(#sf-usdc)" />
        <text x={510} y={136} textAnchor="middle" className="dg-label" fill="#c4b5fd">proof</text>
        <text x={510} y={196} textAnchor="middle" className="dg-label" fill={USDC}>USDC</text>

        {/* human -> recipient */}
        <line x1={727} y1={160} x2={791} y2={160} stroke={FIAT} strokeWidth={2} markerEnd="url(#sf-fiat)" />
        <text x={759} y={186} textAnchor="middle" className="dg-label" fill={FIAT}>fiat</text>

        {nodes.map((n) => {
          const x = n.cx - NW / 2;
          const iconX = n.cx - 12;
          const color = n.color;
          return (
            <g key={n.label}>
              <rect x={x} y={100} width={NW} height={120} rx={14} fill="#0c0c14" stroke="rgba(255,255,255,0.12)" />
              {n.kind === "agent" ? <AgentIcon x={iconX} y={116} size={24} color={color} /> : null}
              {n.kind === "escrow" ? <EscrowIcon x={iconX} y={116} size={24} color={color} /> : null}
              {n.kind === "human" ? <HumanIcon x={iconX} y={116} size={24} color={color} /> : null}
              {n.kind === "recipient" ? <RecipientIcon x={iconX} y={116} size={24} color={color} /> : null}
              <text x={n.cx} y={168} textAnchor="middle" fontSize={14} fontWeight={600} fill="#f4f4f5">{n.label}</text>
              <text x={n.cx} y={188} textAnchor="middle" fontSize={11} fill="#a1a1aa">{n.sub}</text>
            </g>
          );
        })}

        <text x={120} y={252} textAnchor="middle" className="dg-label" fill={MUTED}>needs USDC + a little SOL</text>
        <text x={640} y={252} textAnchor="middle" className="dg-label" fill={MUTED}>spends fiat from their own app</text>
      </svg>

      <ol className="md:hidden space-y-3">
        {mobile.map((s, i) => (
          <li key={s.title} className="flex gap-3 items-start">
            <span
              className="mt-0.5 w-6 h-6 shrink-0 rounded-full border text-[11px] font-mono font-semibold flex items-center justify-center"
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
        <span><i style={{ background: SOL }} /> Solana USDC</span>
        <span><i style={{ background: USDC }} /> USDC in escrow</span>
        <span><i style={{ background: FIAT }} /> Fiat</span>
        <span><i style={{ background: "transparent", borderTop: "2px dashed #c4b5fd" }} /> Payment proof</span>
      </figcaption>
    </figure>
  );
}
