const lanes = [
  { key: "agent", label: "Agent", human: false },
  { key: "escrow", label: "Escrow", human: false },
  { key: "person", label: "Person", human: true },
  { key: "recipient", label: "Recipient", human: true },
] as const;

type LaneKey = (typeof lanes)[number]["key"];

const steps: { title: string; cells: Partial<Record<LaneKey, string>> }[] = [
  {
    title: "Fund",
    cells: {
      agent: "Creates the order: recipient, platform, amount, rate",
      escrow: "USDC locked. Order is open.",
    },
  },
  {
    title: "Claim",
    cells: {
      person: "Claims some or all of it in the Peer app",
      escrow: "That amount is reserved. The claim's clock starts.",
    },
  },
  {
    title: "Pay",
    cells: {
      person: "Sends fiat from their own account",
      recipient: "Receives the fiat",
    },
  },
  {
    title: "Prove",
    cells: {
      person: "Verifies the payment in the app",
      escrow: "Checks the proof against the claim",
    },
  },
  {
    title: "Release",
    cells: {
      escrow: "Releases the reserved USDC to the person",
      agent: "Sees the claim as fulfilled in status",
    },
  },
];

/* Who does what, in order. Pen-tinted cells are a person's actions. */
export default function LifecycleDiagram() {
  return (
    <figure className="figure">
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div
          className="lanes"
          style={{ gridTemplateColumns: `112px repeat(${steps.length}, minmax(0, 1fr))` }}
          role="table"
          aria-label="Order lifecycle by participant"
        >
          <div role="row" className="contents">
            <div role="columnheader" className="lane-head" />
            {steps.map((s, i) => (
              <div key={s.title} role="columnheader" className="lane-head">
                <span className="font-mono text-[10.5px] text-ink-3">{i + 1}</span>
                <span className="block text-[13.5px] font-semibold">{s.title}</span>
              </div>
            ))}
          </div>
          {lanes.map((lane) => (
            <div key={lane.key} role="row" className="contents">
              <div role="rowheader" className="lane-name">
                <span className={lane.human ? "ci" : "sq"} aria-hidden="true" />
                {lane.label}
              </div>
              {steps.map((s) => {
                const cell = s.cells[lane.key];
                return (
                  <div key={s.title} role="cell" className={`lane-cell ${cell ? (lane.human ? "is-human" : "is-machine") : ""}`}>
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
