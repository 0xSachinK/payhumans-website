"use client";
import { useEffect, useState, useRef } from "react";
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import {
  Zkp2pClient,
  createPeerExtensionSdk,
  getContracts,
  type PeerMetadataMessage,
  setLogLevel,
} from "@zkp2p/sdk";
import { usePrivy } from "@privy-io/react-auth";
import { type Hex } from "viem";
setLogLevel("error");
type IntentState = {
  active: boolean;
  message: string;
  owner?: string;
  amount?: string;
  platform?: string;
  expiresAt?: number;
  currency?: string;
  recipient?: string;
  fiatAmount?: string;
  depositId?: string;
};
const supported = [
  "wise",
  "venmo",
  "revolut",
  "cashapp",
  "mercadopago",
  "paypal",
  "monzo",
  "chime",
  "luxon",
  "n26",
  "alipay",
  "zelle",
];
export default function IntentManager({ hash }: { hash: string }) {
  const { address, chainId } = useAccount();
  const { data: wallet } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { login, authenticated } = usePrivy();
  const [state, setState] = useState<IntentState>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [capture, setCapture] = useState<PeerMetadataMessage>();
  const [noPayment, setNoPayment] = useState(false);
  const [tx, setTx] = useState<Hex>();
  const [bank, setBank] = useState("bofa");
  const [business, setBusiness] = useState(false);
  const unsubscribe = useRef<(() => void) | null>(null);
  async function refresh() {
    const r = await fetch(
      `/api/intent/status?hash=${encodeURIComponent(hash)}`,
    );
    const body = await r.json();
    if (!r.ok) throw new Error(body.error);
    setState(body);
    return body as IntentState;
  }
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(
          `/api/intent/status?hash=${encodeURIComponent(hash)}`,
        );
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
        if (alive) setState(body);
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "Could not read intent.");
      }
    };
    void load();
    const timer = setInterval(() => void load(), 20000);
    return () => {
      alive = false;
      clearInterval(timer);
      unsubscribe.current?.();
    };
  }, [hash]);
  async function ready() {
    if (!authenticated) {
      login({ loginMethods: ["passkey", "email"] });
      throw new Error("Sign in, then retry this action.");
    }
    if (!wallet || !address)
      throw new Error("Your wallet is getting ready. Try again shortly.");
    if (chainId !== 8453) {
      await switchChainAsync({ chainId: 8453 });
      throw new Error("Switched to Base. Retry the action.");
    }
    const fresh = await refresh();
    if (fresh.owner?.toLowerCase() !== address.toLowerCase())
      throw new Error("Connect the wallet that claimed this intent.");
    return new Zkp2pClient({
      walletClient: wallet,
      chainId: 8453,
      runtimeEnv: "production",
      baseApiUrl: "https://api.zkp2p.xyz",
      rpcUrl: "https://mainnet.base.org",
    });
  }
  async function startVerification() {
    setError("");
    setCapture(undefined);
    try {
      await ready();
      const fresh = await refresh();
      if (!fresh.active)
        throw new Error("Intent is not active. Do not send a new payment.");
      if (!fresh.platform || !supported.includes(fresh.platform))
        throw new Error(
          "This payment platform is not supported by on-site verification yet.",
        );
      const ext = createPeerExtensionSdk();
      if (!ext.isAvailable())
        throw new Error(
          "Install and enable the Peer payment verification extension, then reload this page.",
        );
      if (!(await ext.requestConnection()))
        throw new Error("Extension connection was declined.");
      unsubscribe.current?.();
      unsubscribe.current = ext.onMetadataMessage((m) => {
        if (m.platform !== fresh.platform) return;
        if (m.errorMessage) {
          setError(m.errorMessage);
          return;
        }
        if (!m.buyerTeeCapture?.encryptedSessionMaterial) {
          setError(
            "The extension did not return a verifiable payment session.",
          );
          return;
        }
        setCapture(m);
        setMessage("Select the payment you sent for this intent.");
      });
      const action =
        fresh.platform === "zelle"
          ? `transfer_zelle_${bank}`
          : fresh.platform === "paypal" && business
            ? "transfer_business_paypal"
            : `transfer_${fresh.platform}`;
      ext.authenticate({
        platform: fresh.platform,
        actionType: action,
        attestationActionType: action,
        captureMode: "buyerTee",
        callerAddress: address,
      });
      setMessage("Complete payment authentication in the Peer extension.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open verification.");
    }
  }
  async function transact(kind: "cancel" | "fulfill", index?: number) {
    setBusy(true);
    setError("");
    try {
      const client = await ready();
      const latest = await refresh();
      if (tx)
        throw new Error(
          "A transaction was already submitted. Check its confirmation before retrying.",
        );
      if (kind === "cancel" && !noPayment)
        throw new Error("Confirm you have not sent fiat before cancelling.");
      if (kind === "fulfill" && (!latest.active || !capture?.buyerTeeCapture))
        throw new Error("An active intent and captured payment are required.");
      if (kind === "fulfill" && capture && capture.expiresAt < Date.now())
        throw new Error("Payment session expired. Authenticate again.");
      setMessage(
        kind === "fulfill"
          ? "Verifying payment evidence with Peer…"
          : "Preparing cancellation…",
      );
      const row = capture?.metadata.find((r) => r.originalIndex === index);
      const action =
        state?.platform === "zelle"
          ? `transfer_zelle_${bank}`
          : state?.platform === "paypal" && business
            ? "transfer_business_paypal"
            : `transfer_${state?.platform}`;
      const prepared =
        kind === "cancel"
          ? await client.cancelIntent.prepare({ intentHash: hash as Hex })
          : await client.fulfillIntent.prepare({
              intentHash: hash as Hex,
              proof: {
                proofType: "buyerTee",
                encryptedSessionMaterial:
                  capture!.buyerTeeCapture!.encryptedSessionMaterial,
                params: row?.params ??
                  capture?.buyerTeeCapture?.params?.[index ?? 0] ?? {
                    index: index ?? 0,
                  },
                actionPlatform: state!.platform!,
                actionType: action,
              },
            });
      const contracts = getContracts(8453, "production");
      const allowed = [
        contracts.addresses.orchestratorV3,
        contracts.addresses.orchestratorV2,
        contracts.addresses.orchestrator,
      ]
        .filter(Boolean)
        .map((a) => a!.toLowerCase());
      if (
        prepared.chainId !== 8453 ||
        !allowed.includes(prepared.to.toLowerCase()) ||
        (prepared.value ?? 0n) !== 0n
      )
        throw new Error("Unexpected transaction target.");
      await client.publicClient.call({
        account: wallet!.account,
        to: prepared.to,
        data: prepared.data,
        value: 0n,
      });
      setMessage("Confirm the transaction in your wallet.");
      const submitted = await wallet!.sendTransaction({
        to: prepared.to,
        data: prepared.data,
        value: 0n,
      });
      setTx(submitted);
      setMessage("Waiting for confirmation…");
      const receipt = await client.publicClient.waitForTransactionReceipt({
        hash: submitted,
      });
      if (receipt.status !== "success")
        throw new Error(
          "Transaction reverted. Review the transaction before retrying.",
        );
      setMessage(
        kind === "fulfill"
          ? "Payment verified and fulfillment transaction confirmed."
          : "Intent cancellation confirmed.",
      );
      setCapture(undefined);
      await refresh();
    } catch (e) {
      setError(
        (e as { shortMessage?: string }).shortMessage ||
          (e instanceof Error ? e.message : "Transaction failed."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="border border-white/15 rounded-xl p-5 my-5">
      <h3 className="text-lg font-medium mb-3">Your payment intent</h3>
      <code className="block text-xs break-all text-[var(--muted)]">
        {hash}
      </code>
      {state && (
        <>
          <p className="text-sm mt-4">{state.message}</p>
          {state.recipient && (
            <dl className="text-sm mt-3 space-y-2">
              <div>
                <dt className="text-[var(--muted)]">Recipient</dt>
                <dd className="break-all">{state.recipient}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Fiat to send</dt>
                <dd>
                  {state.fiatAmount} {state.currency}
                </dd>
              </div>
            </dl>
          )}
          {state.expiresAt && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Expires: {new Date(state.expiresAt).toLocaleString()} ·{" "}
              {state.amount} USDC · {state.platform}
            </p>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-amber-200 my-4 break-words">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-[var(--green)] my-4">
          {message}
        </p>
      )}
      {tx && (
        <a
          className="text-sm underline block my-3"
          href={`https://basescan.org/tx/${tx}`}
          target="_blank"
          rel="noreferrer"
        >
          View latest transaction ↗
        </a>
      )}
      <button
        disabled={busy}
        className="text-xs underline my-3"
        onClick={() => void refresh().catch((e) => setError(e.message))}
      >
        Refresh status
      </button>
      {state?.active && (
        <>
          <p className="text-xs text-[var(--muted)] my-3">
            After sending the exact fiat payment, use the Peer extension to
            capture payment evidence. Only cryptographically verified evidence
            can release escrow. Your encrypted session is handled in memory and
            sent to Peer for verification.
          </p>
          {state.platform === "zelle" && (
            <label className="text-sm block my-3">
              Your bank
              <select
                className="block bg-[#151817] p-2 mt-1"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option value="bofa">Bank of America</option>
                <option value="chase">Chase</option>
                <option value="citi">Citi</option>
              </select>
            </label>
          )}
          {state.platform === "paypal" && (
            <label className="text-xs flex gap-2 my-3">
              <input
                type="checkbox"
                checked={business}
                onChange={(e) => setBusiness(e.target.checked)}
              />
              PayPal Business account
            </label>
          )}
          <button
            disabled={busy || !!tx}
            onClick={() => void startVerification()}
            className="w-full bg-[var(--green)] text-black rounded-lg p-3 text-sm font-medium disabled:opacity-40"
          >
            I paid — verify payment
          </button>
          <a
            className="text-xs underline inline-block my-3"
            target="_blank"
            rel="noreferrer"
            href="https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih"
          >
            Get the Peer verification extension ↗
          </a>
          {capture && (
            <div className="space-y-2 my-4">
              {capture.metadata
                .filter((r) => !r.hidden)
                .map((row) => (
                  <button
                    key={row.originalIndex}
                    disabled={busy || !!tx}
                    onClick={() => void transact("fulfill", row.originalIndex)}
                    className="block w-full text-left border border-white/15 rounded-lg p-3 text-xs disabled:opacity-40"
                  >
                    Verify {row.amount} {row.currency} ·{" "}
                    {row.recipient || "recipient shown in payment app"} ·{" "}
                    {row.date}
                  </button>
                ))}
              {!capture.metadata.some((r) => !r.hidden) && (
                <p className="text-sm">
                  No payments found. Authenticate again after the payment
                  appears.
                </p>
              )}
            </div>
          )}
          <div className="border-t border-white/10 pt-4 mt-4">
            <label className="text-xs flex gap-2">
              <input
                type="checkbox"
                checked={noPayment}
                onChange={(e) => setNoPayment(e.target.checked)}
              />
              I have not sent fiat for this intent.
            </label>
            <button
              disabled={busy || !!tx || !noPayment}
              onClick={() => void transact("cancel")}
              className="text-sm underline mt-3 disabled:opacity-40"
            >
              Cancel unpaid intent
            </button>
          </div>
        </>
      )}
    </section>
  );
}
