import { isAddress, parseUnits } from "viem";
import { getJobs, protocolClient, errorMessage } from "@/lib/protocol";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isAddress(body.account))
      throw new Error("Connect a valid Base wallet.");
    if (
      typeof body.amount !== "string" ||
      !/^\d+(?:\.\d{1,6})?$/.test(body.amount)
    )
      throw new Error("Enter a valid USDC amount (up to 6 decimals).");
    const job = (await getJobs(String(body.depositId))).find(
      (j) => j.id === body.jobId,
    );
    if (!job || !job.accepting)
      throw new Error("This request is not available for claiming.");
    const amount = parseUnits(body.amount, 6);
    if (
      amount < parseUnits(job.min, 6) ||
      amount > parseUnits(job.max, 6) ||
      amount <= 0n
    )
      throw new Error(`Claim between ${job.min} and ${job.max} USDC.`);
    const client = protocolClient(body.account);
    // Resolve all payment terms from current chain state, never trust client-supplied payee/rate.
    const prepared = await client.signalIntent.prepare({
      depositId: BigInt(job.depositId),
      amount,
      toAddress: body.account,
      processorName: job.platform,
      payeeDetails: job.payeeHash,
      fiatCurrencyCode: job.currency,
      conversionRate: job.rateRaw,
    });
    return Response.json(
      {
        transaction: {
          to: prepared.to,
          data: prepared.data,
          value: (prepared.value ?? 0n).toString(),
          chainId: prepared.chainId,
        },
        job,
        amount: body.amount,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
