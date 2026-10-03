import Link from "next/link";
import PaymentOrder from "./PaymentOrder";
import { InstallChip } from "./CodeBlock";
import { CLI, LINKS, SETTLEMENT } from "@/lib/constants";

const facts = [
  {
    label: "Funded with",
    value: "Supported crypto",
    note: "USDC on Solana is tested on mainnet. Other routes are listed in the docs with their status.",
    href: "/docs#routes",
  },
  {
    label: "Held as",
    value: `${SETTLEMENT.asset} on ${SETTLEMENT.chain}`,
    note: "Every order settles in Peer's escrow contract, whatever it was funded with.",
    href: "/docs#settlement",
  },
  {
    label: "Keys stay with",
    value: "Your agent",
    note: "The CLI signs with the agent's own wallet. No sign-up and no custody by PayHumans.",
    href: "/docs#keys",
  },
];

export default function Hero() {
  return (
    <section className="pt-12 md:pt-20">
      <div className="wrap grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] gap-12 lg:gap-16 items-center">
        <div>
          <p className="label mb-6 flex items-center gap-2.5">
            <span className="sq" aria-hidden="true" />
            Fiat payments for AI agents
          </p>
          <h1 className="display">
            <span className="machine">Agents fund it.</span>
            <span className="pen">Humans pay it.</span>
          </h1>
          <p className="lede mt-7 max-w-[34rem]">
            Your agent can hold crypto, but it can&apos;t open a bank account. With PayHumans it
            funds a payment order and names who to pay. A person sends the money from their
            own payment app, then collects the crypto once the payment is verified.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-3">
            <InstallChip command={CLI.install} />
            <Link href={LINKS.cliDocs} className="btn btn-ink">
              Agent quickstart <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <p className="small mt-5">
            Agents can start from{" "}
            <a href={LINKS.llms} className="link font-mono text-[13px]">
              /llms.txt
            </a>
            . People who want to fill orders use the{" "}
            <Link href={LINKS.earn} className="link">
              Peer app
            </Link>
            .
          </p>
        </div>

        <PaymentOrder />
      </div>

      <div className="wrap mt-16 md:mt-24">
        <dl className="grid md:grid-cols-3 border-y border-rule">
          {facts.map((f, n) => (
            <div
              key={f.label}
              className={`py-6 md:py-7 ${n ? "border-t md:border-t-0 md:border-l border-rule md:pl-7" : ""} ${n < 2 ? "md:pr-7" : ""}`}
            >
              <dt className="label">{f.label}</dt>
              <dd className="mt-2">
                <Link href={f.href} className="text-[1.25rem] font-medium tracking-[-0.02em] hover:text-pen transition-colors">
                  {f.value}
                </Link>
                <p className="small mt-1.5 max-w-[30ch]">{f.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
