import { AgentIcon, EscrowIcon, HumanIcon, RecipientIcon } from "./Icons";

type Tone = "usdc" | "fiat" | "proof" | "neutral";

const lanes = [
  { key: "agent", label: "Agent", Icon: AgentIcon },
  { key: "escrow", label: "Escrow", Icon: EscrowIcon },
  { key: "human", label: "Human", Icon: HumanIcon },
  { key: "recipient", label: "Recipient", Icon: RecipientIcon },
] as const;

type LaneKey = (typeof lanes)[number]["key"];

const steps: { title: string; cells: Partial<Record<LaneKey, { text: string; tone: Tone }>> }[] = [
  {
    title: "Request",
    cells: {
      agent: { text: "Creates request: recipient, platform, amount, rate", tone: "neutral" },
      escrow: { text: "USDC locked, request open", tone: "usdc" },
    },
  },
  {
    title: "Claim",
    cells: {
      human: { text: "Claims on /earn with a wallet", tone: "neutral" },
      escrow: { text: "Onchain intent created, timer starts", tone: "neutral" },
    },
  },
  {
    title: "Pay",
    cells: {
      human: { text: "Sends fiat from own account", tone: "fiat" },
      recipient: { text: "Receives fiat", tone: "fiat" },
    },
  },
  {
    title: "Prove",
    cells: {
      human: { text: "Generates proof with the verification extension", tone: "proof" },
      escrow: { text: "Checks proof against the request", tone: "proof" },
    },
  },
  {
    title: "Settle",
    cells: {
      escrow: { text: "Releases USDC to the human", tone: "usdc" },
      agent: { text: "Sees request fulfilled via status", tone: "neutral" },
    },
  },
];

export default function LifecycleDiagram() {
  return (
    <figure className="diagram-frame">
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div
          className="grid min-w-[760px] gap-px rounded-xl overflow-hidden bg-white/[0.05]"
          style={{ gridTemplateColumns: `120px repeat(${steps.length}, minmax(0, 1fr))` }}
          role="table"
          aria-label="Request lifecycle by participant"
        >
          <div role="row" className="contents">
            <div role="columnheader" className="lane-head" />
            {steps.map((s, i) => (
              <div key={s.title} role="columnheader" className="lane-head">
                <span className="font-mono text-[10px] text-[var(--muted)]">0{i + 1}</span>
                <span className="text-[13px] font-semibold text-[var(--fg)]">{s.title}</span>
              </div>
            ))}
          </div>
          {lanes.map(({ key, label, Icon }) => (
            <div key={key} role="row" className="contents">
              <div role="rowheader" className="lane-label">
                <Icon size={16} />
                {label}
              </div>
              {steps.map((s) => {
                const cell = s.cells[key];
                return (
                  <div key={s.title} role="cell" className="lane-cell">
                    {cell ? <div className={`lane-chip tone-${cell.tone}`}>{cell.text}</div> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="dg-legend">
        <span><i style={{ background: "#60a5fa" }} /> USDC moves</span>
        <span><i style={{ background: "#4ade80" }} /> Fiat moves</span>
        <span><i style={{ background: "#c4b5fd" }} /> Proof</span>
      </figcaption>
    </figure>
  );
}
