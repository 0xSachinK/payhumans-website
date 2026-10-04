import Link from "next/link";
import CodeBlock from "./CodeBlock";
import { CLI, CLI_QUICKSTART, LINKS } from "@/lib/constants";

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
