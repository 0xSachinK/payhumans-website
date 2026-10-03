import { agentGuide } from "@/lib/agent-guide";

export const dynamic = "force-static";

export function GET() {
  return Response.json(agentGuide(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
