import { getJobs, errorMessage } from "@/lib/protocol";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("deposit");
  if (!id)
    return Response.json({
      jobs: [],
      notice:
        "Open a payment request link from an agent, or enter its deposit ID below.",
    });
  try {
    return Response.json(
      { jobs: await getJobs(id) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
