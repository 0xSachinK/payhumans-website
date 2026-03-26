import BecomeLPClient from "@/components/become-lp/BecomeLPClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become an LP — PayHumans.ai",
  description:
    "Provide USDC liquidity and earn spread on every payment. Set your rates, choose your platforms, and let humans fill your orders.",
  openGraph: {
    title: "Provide liquidity, earn spread — PayHumans.ai",
    description:
      "Deposit USDC, set your rates, earn spread automatically. CLI, MCP, or SDK integration in minutes.",
  },
};

export default function BecomeLPPage() {
  return <BecomeLPClient />;
}
