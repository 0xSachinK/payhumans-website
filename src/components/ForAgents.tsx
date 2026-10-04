import Link from "next/link";
import CodeBlock from "./CodeBlock";
import { CLI, CLI_QUICKSTART, LINKS } from "@/lib/constants";

const traits = [
  {
    name: "Preview first",
    body: (
      <>
        Every command that spends prints its plan as JSON and stops. Add{" "}
        <code className="inline-code">--yes</code> to sign.
      </>
    ),
  },
  {
    name: "Capped spend",
    body: (
      <>
        <code className="inline-code">--max-source-spend</code> stops the route taking more
        of your funding asset than you allow, route fees included. Separate limits cover
        gas. A few network costs sit outside them.
      </>
    ),
  },
  {
    name: "IDs to poll",
    body: "Creating an order returns a deposit ID. Read it at any time to see what is available, reserved and fulfilled.",
  },
  {
    name: "Recoverable",
    body: "Withdraw whatever has not been claimed to your own wallet on Base. A Solana wallet can route it home with one more command.",
  },
  {
    name: "No account",
    body: "The agent's own key signs. There is no sign-up, no API key and no hosted wallet.",
  },
];

export default function ForAgents() {
  return (
    <section id="agents" className="band band-tint">
      <div className="wrap">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
          <div>
            <p className="label mb-4 flex items-center gap-2.5">
              <span className="sq" aria-hidden="true" />
              For agents
            </p>
            <h2 className="h2">A CLI your agent can run unattended.</h2>
            <p className="lede mt-5">
              <code className="inline-code">{CLI.bin}</code> is one small npm package with JSON
              output. It finds out what can be paid, quotes routing costs, funds the order,
              reports its status, and takes back what nobody claimed.
            </p>

            <dl className="rows mt-9">
              {traits.map((t) => (
                <div key={t.name} className="grid sm:grid-cols-[130px_minmax(0,1fr)] gap-x-5 gap-y-1 py-4">
                  <dt className="label pt-[3px]">{t.name}</dt>
                  <dd className="text-[15px] leading-[1.55] text-ink-2">{t.body}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={LINKS.cliDocs} className="btn btn-ink">
                Agent quickstart <span className="arrow" aria-hidden="true">&rarr;</span>
              </Link>
              <a href={LINKS.llms} className="btn btn-line font-mono text-[13.5px]">
                /llms.txt
              </a>
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <CodeBlock title={`${CLI.bin} · Node ${CLI.node}+`}>{CLI_QUICKSTART}</CodeBlock>
            <p className="small mt-4">
              Shown with the tested route: a Solana wallet holding USDC. Set the key in{" "}
              <code className="inline-code">PAYHUMANS_SOLANA_KEY</code> through your secret
              manager, never on the command line.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
