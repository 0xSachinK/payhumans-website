export const FLOW_STEPS = [
  {
    human: false,
    title: "Agent funds an order",
    body: "Its crypto is converted to USDC on Base and locked in Peer's escrow, along with the recipient, platform, currency and rate.",
  },
  {
    human: true,
    title: "A person claims it",
    body: "In the Peer app. The amount they claim is reserved for them for a limited time.",
  },
  {
    human: true,
    title: "They send the fiat",
    body: "From their own payment account, straight to the recipient the agent named.",
  },
  {
    human: true,
    title: "They prove the payment",
    body: "Peer checks the proof against the order: recipient, amount, currency and timing.",
  },
  {
    human: false,
    title: "Escrow releases the crypto",
    body: "To the person who paid, less Peer's fees. With no valid proof in time, the claim expires and its funds become available again.",
  },
];

/* Step badge: square when a machine acts, round when a person does. */
function Badge({ n, x, y, human }: { n: number; x: number; y: number; human: boolean }) {
  return (
    <g>
      {human ? (
        <circle cx={x} cy={y} r={11} fill="var(--pen)" />
      ) : (
        <rect x={x - 10} y={y - 10} width={20} height={20} rx={3} fill="var(--ink)" />
      )}
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="#fff" className="font-mono">
        {n}
      </text>
    </g>
  );
}

export default function FlowDiagram() {
  return (
    <figure className="figure">
      <svg viewBox="0 0 1040 270" className="hidden lg:block w-full h-auto" role="img" aria-labelledby="flow-title flow-desc">
        <title id="flow-title">How a PayHumans order moves</title>
        <desc id="flow-desc">
          An agent funds an order with crypto, which is converted to USDC on Base and locked in Peer escrow. A person
          claims it, sends fiat to the recipient, proves the payment, and the escrow releases the USDC to that person.
        </desc>
        <defs>
          <marker id="flow-ink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0.5L9 5L0 9.5z" fill="var(--ink)" />
          </marker>
          <marker id="flow-pen" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0.5L9 5L0 9.5z" fill="var(--pen)" />
          </marker>
          <marker id="flow-proof" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0.5L9 5L0 9.5z" fill="var(--ink-3)" />
          </marker>
        </defs>

        {/* crypto leg */}
        <line x1={146} y1={112} x2={202} y2={112} stroke="var(--ink)" strokeWidth={2} markerEnd="url(#flow-ink)" />
        <text x={175} y={136} textAnchor="middle" fontSize={11} className="dg-m">crypto</text>
        <line x1={332} y1={112} x2={388} y2={112} stroke="var(--ink)" strokeWidth={2} markerEnd="url(#flow-ink)" />
        <text x={361} y={136} textAnchor="middle" fontSize={11} className="dg-m">USDC</text>
        <Badge n={1} x={175} y={84} human={false} />

        {/* claim and proof travel from the person to escrow; USDC travels back */}
        <line x1={698} y1={92} x2={546} y2={92} stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="4 4" markerEnd="url(#flow-proof)" />
        <text x={620} y={80} textAnchor="middle" fontSize={11} className="dg-m">claim, then proof</text>
        <Badge n={2} x={607} y={54} human />
        <Badge n={4} x={633} y={54} human />
        <line x1={540} y1={134} x2={694} y2={134} stroke="var(--ink)" strokeWidth={2} markerEnd="url(#flow-ink)" />
        <text x={620} y={156} textAnchor="middle" fontSize={11} className="dg-m">USDC</text>
        <Badge n={5} x={620} y={180} human={false} />

        {/* fiat leg */}
        <line x1={820} y1={112} x2={898} y2={112} stroke="var(--pen)" strokeWidth={2} markerEnd="url(#flow-pen)" />
        <text x={860} y={138} textAnchor="middle" fontSize={15} className="dg-pen">fiat</text>
        <Badge n={3} x={860} y={84} human />

        {/* machines are square */}
        <rect x={24} y={66} width={120} height={92} rx={10} fill="var(--card)" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={84} y={108} textAnchor="middle" fontSize={17} fontWeight={600} className="dg-t">Agent</text>
        <text x={84} y={130} textAnchor="middle" fontSize={11} className="dg-m">its own wallet</text>

        <rect x={210} y={66} width={120} height={92} rx={10} fill="var(--card)" stroke="var(--ink-3)" strokeWidth={1.25} strokeDasharray="5 4" />
        <text x={270} y={108} textAnchor="middle" fontSize={17} fontWeight={600} className="dg-t">Route</text>
        <text x={270} y={130} textAnchor="middle" fontSize={11} className="dg-m">swap or bridge</text>

        <rect x={396} y={54} width={140} height={116} rx={10} fill="var(--ink)" />
        <text x={466} y={104} textAnchor="middle" fontSize={17} fontWeight={600} fill="var(--paper)" className="font-sans">Escrow</text>
        <text x={466} y={126} textAnchor="middle" fontSize={11} fill="var(--paper)" opacity={0.72} className="font-mono">USDC on Base</text>
        <text x={466} y={143} textAnchor="middle" fontSize={11} fill="var(--paper)" opacity={0.72} className="font-mono">Peer contract</text>

        {/* people are round */}
        <circle cx={760} cy={112} r={58} fill="var(--card)" stroke="var(--pen)" strokeWidth={1.5} />
        <text x={760} y={112} textAnchor="middle" fontSize={23} className="dg-pen">Person</text>
        <text x={760} y={134} textAnchor="middle" fontSize={11} className="dg-m">payment app</text>

        <circle cx={962} cy={112} r={58} fill="var(--card)" stroke="var(--pen)" strokeWidth={1.5} />
        <text x={962} y={112} textAnchor="middle" fontSize={23} className="dg-pen">Recipient</text>
        <text x={962} y={134} textAnchor="middle" fontSize={11} className="dg-m">gets fiat</text>

        {/* where each leg happens */}
        <path d="M24 214v8h512v-8" fill="none" stroke="var(--rule-strong)" />
        <text x={280} y={246} textAnchor="middle" fontSize={11} letterSpacing="0.09em" className="dg-m">ON-CHAIN: THE CRYPTO LEG</text>
        <path d="M702 214v8h318v-8" fill="none" stroke="var(--rule-strong)" />
        <text x={861} y={246} textAnchor="middle" fontSize={11} letterSpacing="0.09em" className="dg-m">OFF-CHAIN: THE FIAT LEG</text>
      </svg>

      <ol className="grid gap-5 lg:grid-cols-5 lg:gap-6 lg:mt-7 lg:pt-6 lg:border-t lg:border-rule">
        {FLOW_STEPS.map((s, n) => (
          <li key={s.title} className="grid content-start grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-1 gap-x-3.5 gap-y-2.5">
            <span
              className={`w-[22px] h-[22px] flex items-center justify-center font-mono text-[11.5px] font-semibold text-white ${
                s.human ? "rounded-full bg-pen" : "rounded-[3px] bg-ink"
              }`}
              aria-hidden="true"
            >
              {n + 1}
            </span>
            <div>
              <h3 className={`text-[15px] font-semibold leading-snug ${s.human ? "text-pen" : ""}`}>{s.title}</h3>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <figcaption>
        <span><i className="sq" /> a machine acts</span>
        <span><i className="ci" /> a person acts</span>
        <span className="!hidden lg:!inline-flex"><i className="key-line" /> crypto</span>
        <span className="!hidden lg:!inline-flex"><i className="key-line pen-line" /> fiat</span>
        <span className="!hidden lg:!inline-flex"><i className="key-line proof-line" /> claim and proof</span>
      </figcaption>
    </figure>
  );
}
