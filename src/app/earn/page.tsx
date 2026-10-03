import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AppDownload from "@/components/AppDownload";
import { LINKS, PLATFORM_SETS, listOf } from "@/lib/constants";

// /earn/* is served with a per-request CSP nonce, so it must render per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fill orders with the Peer app",
  description:
    "Send a fiat payment an AI agent asked for and collect the crypto it put in escrow. Get the Peer mobile app, find an order on a payment platform you already use, pay, verify, and receive USDC.",
  alternates: { canonical: "/earn" },
  openGraph: {
    title: "Send a payment. Collect the crypto.",
    description:
      "AI agents put up crypto for payments they need made. Fill those orders in the Peer mobile app from a payment account you already have.",
    url: "/earn",
  },
};

// Links issued for a specific order or claim keep working: they open the claim page.
const CLAIM_PARAMS = ["deposit", "intent", "claimTx"];

const steps = [
  {
    title: "Install Peer and sign in",
    body: "The app sets up a wallet for you. That is where your USDC arrives. There is no PayHumans account to create.",
  },
  {
    title: "Open the P2P tab",
    body: "It lists open orders you can browse. If your version doesn't show it, use Buy USDC: filling an order is buying USDC at the agent's price. Don't use the Earn tab; that is for supplying crypto, which is the agent's side.",
  },
  {
    title: "Choose how you'll pay",
    body: `Pick your currency and a payment platform you already use. The app supports ${listOf(PLATFORM_SETS.inAppConfirmed)}. Newer versions add ${listOf(PLATFORM_SETS.inAppNewer)}.`,
  },
  {
    title: "Claim an order",
    body: "Before you confirm, the app shows who to pay, the exact fiat amount, the USDC you will receive after Peer's fees, and how long you have.",
  },
  {
    title: "Send the payment",
    body: "From your own account, to exactly that recipient, for exactly that amount, in one payment.",
  },
  {
    title: "Verify it in the app",
    body: "The app checks the payment against your claim. When it matches, the escrow releases the USDC to your wallet, less Peer's fees.",
  },
];

const platformRules = [
  { name: "Revolut", rule: "Send in the order's currency. Don't let Revolut convert from another currency." },
  { name: "Wise", rule: "The recipient must receive at least the amount shown after Wise's fees, in a single transfer." },
  { name: "PayPal", rule: "Friends and Family only. If Goods and Services is the only option, don't pay. Leave the note empty." },
  { name: "Venmo", rule: "Pay as friends, not as a purchase, to the exact handle shown." },
  { name: "Zelle", rule: "The app verifies Zelle payments sent from Bank of America or Citi." },
  { name: "UPI", rule: "The app verifies UPI payments through Amazon Pay: person-to-person, from a linked bank account. UPI Lite and merchant payments don't count." },
];

export default async function EarnPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  if (CLAIM_PARAMS.some((key) => params[key])) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      for (const v of Array.isArray(value) ? value : [value]) if (v !== undefined) query.append(key, v);
    }
    redirect(`${LINKS.recover}?${query.toString()}`);
  }

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <section className="pt-12 md:pt-20">
          <div className="wrap grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] gap-12 lg:gap-20 items-center">
            <div>
              <p className="label mb-6 flex items-center gap-2.5">
                <span className="ci" aria-hidden="true" />
                For humans
              </p>
              <h1 className="text-[clamp(2.25rem,5.4vw,3.75rem)] font-medium tracking-[-0.04em] leading-[1.02]">
                Send a payment.
                <span className="pen block text-[1.12em] leading-none mt-1">Collect the crypto.</span>
              </h1>
              <p className="lede mt-7 max-w-[34rem]">
                AI agents put up crypto for payments they need made. You make the payment
                from an account you already have, and the crypto is released to you once
                the payment is verified. It all happens in the Peer mobile app.
              </p>
              <p className="small mt-5 max-w-[34rem]">
                Have a link from an agent, or a claim you made on this site?{" "}
                <Link href={LINKS.recover} className="link">
                  Open the claim page
                </Link>
                .
              </p>
            </div>
            <AppDownload />
          </div>
        </section>

        <section className="band">
          <div className="wrap grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-8 lg:gap-16">
            <div>
              <p className="label mb-4">Getting started</p>
              <h2 className="h2">Six steps, one app.</h2>
              <p className="body mt-4 text-[15px]">
                Screens change between app versions. Follow what the app shows; these are
                the steps it takes you through. We wrote them from the app&apos;s current
                source and have not yet walked through them on a store build.
              </p>
            </div>
            <ol className="rows">
              {steps.map((s, n) => (
                <li key={s.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-5">
                  <span
                    className="mt-0.5 w-6 h-6 rounded-full bg-pen text-white font-mono text-[12px] font-semibold flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {n + 1}
                  </span>
                  <div>
                    <h3 className="h3">{s.title}</h3>
                    <p className="text-[15px] leading-[1.55] text-ink-2 mt-1 max-w-[52ch]">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band band-tint">
          <div className="wrap grid md:grid-cols-2 gap-x-16 gap-y-14">
            <div>
              <p className="label mb-4">Finding orders</p>
              <h2 className="text-[1.5rem] font-medium tracking-[-0.025em] leading-tight">
                Agent orders look like any other order.
              </h2>
              <ul className="rows mt-6">
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  They are not labelled as PayHumans. They sit alongside every other Peer
                  order for the same platform and currency.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  What you see depends on the currency, platform and amount you choose.
                  Change those and the list changes. The app also leaves out orders that
                  fail its own checks, such as ones worth under about $1. A new order
                  takes a short while to show up, and the list refreshes about once a
                  minute.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  If an agent sent you a link, open it first. The{" "}
                  <Link href={LINKS.recover} className="link">
                    claim page
                  </Link>{" "}
                  shows that order&apos;s recipient, rate and what is left, so you know what
                  to look for in the app.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  Some orders ask you to post stake before claiming. The app tells you
                  when one does.
                </li>
              </ul>
            </div>

            <div>
              <p className="label mb-4">Alerts</p>
              <h2 className="text-[1.5rem] font-medium tracking-[-0.025em] leading-tight">
                Notifications are opt-in, and filtered.
              </h2>
              <ul className="rows mt-6">
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  Alerts for new orders are off until you turn them on in the app and
                  allow notifications on your phone.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  You choose which platforms to hear about, the worst price you will
                  accept, and a minimum order size. Alerts cover{" "}
                  {PLATFORM_SETS.alerts.length} platforms: {listOf(PLATFORM_SETS.alerts)}.
                  There are none for {listOf(PLATFORM_SETS.inAppNewer)}.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  The minimum size starts at $25. Many agent orders are smaller, so lower
                  it if you want to hear about them.
                </li>
                <li className="py-4 text-[15px] leading-[1.55] text-ink-2">
                  Peer limits how many alerts it sends, so not every order produces one,
                  and we have not confirmed delivery ourselves. Check the app rather than
                  waiting for a notification.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-8 lg:gap-16">
            <div>
              <p className="label mb-4">Before you pay</p>
              <h2 className="h2">You send your own money first.</h2>
              <p className="body mt-4 text-[15px]">
                The escrow only releases when the payment matches the claim. A payment
                that doesn&apos;t match cannot be recovered through PayHumans or Peer.
              </p>
            </div>
            <div>
              <ul className="rows">
                {[
                  "Claim first, then pay. A payment made before the claim does not count.",
                  "Pay the exact amount, to the exact recipient, in the currency shown, in one payment.",
                  "Verify before your claim expires. If you can't pay in time, cancel the claim instead.",
                  "Use an account in your own name, and follow your payment platform's rules.",
                ].map((rule) => (
                  <li key={rule} className="py-4 text-[15.5px] leading-normal text-ink">
                    {rule}
                  </li>
                ))}
              </ul>

              <h3 className="label mt-12 mb-1">Platform specifics</h3>
              <dl className="rows">
                {platformRules.map((p) => (
                  <div key={p.name} className="grid sm:grid-cols-[110px_minmax(0,1fr)] gap-x-5 gap-y-1 py-4">
                    <dt className="text-[15px] font-semibold">{p.name}</dt>
                    <dd className="text-[15px] leading-[1.55] text-ink-2">{p.rule}</dd>
                  </div>
                ))}
              </dl>
              <p className="small mt-4">
                Peer&apos;s own guide goes further:{" "}
                <a href={LINKS.peerBuyerGuide} target="_blank" rel="noopener noreferrer" className="link">
                  the complete buyer guide
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="band band-tint">
          <div className="wrap grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center">
            <div className="max-w-[40rem]">
              <p className="label mb-4">Claim page</p>
              <h2 className="text-[1.5rem] font-medium tracking-[-0.025em] leading-tight">
                Look up an order, or recover a claim made on this site.
              </h2>
              <p className="body mt-3 text-[15px]">
                Links like <span className="font-mono text-[13px]">payhumans.ai/earn?deposit=…</span> open
                it automatically. It shows an order&apos;s live terms, and keeps the original
                browser flow working for claims already made here: reopen, verify or
                cancel.
              </p>
            </div>
            <Link href={LINKS.recover} className="btn btn-line">
              Open the claim page <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
