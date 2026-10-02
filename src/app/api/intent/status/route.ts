import {
  getContracts,
  getCurrencyCodeFromHash,
  getPaymentMethodsCatalog,
} from "@zkp2p/sdk";
import { formatUnits, type Address, type Hex } from "viem";
import { protocolClient, errorMessage, getJobs } from "@/lib/protocol";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("hash");
  if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash))
    return Response.json({ error: "Invalid intent hash." }, { status: 400 });
  try {
    const client = protocolClient();
    const view = await client.getIntent(hash as Hex);
    const i = view.intent;
    if (!i.timestamp || !i.amount)
      return Response.json({
        active: false,
        message:
          "This intent is no longer active. It may have been fulfilled, cancelled, or pruned. Check its transaction history before paying.",
      });
    const contracts = getContracts(8453, "production");
    if (!contracts.abis.escrowV2) throw new Error("Escrow ABI unavailable.");
    const escrowIntent = (await client.publicClient.readContract({
      address: i.escrow as Address,
      abi: contracts.abis.escrowV2,
      functionName: "getDepositIntent",
      args: [i.depositId, hash as Hex],
    })) as { expiryTime: bigint; amount: bigint };
    const block = await client.publicClient.getBlock();
    const expiry = escrowIntent.expiryTime;
    const platform = Object.entries(
      getPaymentMethodsCatalog(8453, "production"),
    ).find(
      ([, v]) =>
        v.paymentMethodHash.toLowerCase() === i.paymentMethod.toLowerCase(),
    )?.[0];
    const currency = getCurrencyCodeFromHash(i.fiatCurrency as Hex);
    const job = (await getJobs(i.depositId.toString())).find(
      (j) => j.platform === platform && j.currency === currency,
    );
    const fiatAmount = formatUnits(
      (i.amount * i.conversionRate + 10n ** 22n - 1n) / 10n ** 22n,
      2,
    );
    return Response.json(
      {
        recipient: job?.recipient,
        fiatAmount,
        active: escrowIntent.amount > 0n && expiry > block.timestamp,
        owner: i.owner,
        to: i.to,
        depositId: i.depositId.toString(),
        amount: formatUnits(i.amount, 6),
        platform,
        currency: getCurrencyCodeFromHash(i.fiatCurrency as Hex),
        expiresAt: Number(expiry) * 1000,
        message:
          expiry > block.timestamp
            ? "Active intent — check the recipient and exact amount before paying."
            : "Intent expired. Do not send a payment.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
