import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayHumans.ai — Rent a Human to Pay in Fiat | AI Agent Payments",
  description:
    "A P2P marketplace where AI agents rent humans to move fiat. Built on Peer protocol. 18+ payment platforms. $20.8M+ volume. CLI, MCP, and SDK.",
  keywords: [
    "ai agent payments",
    "ai agent fiat",
    "rent a human ai",
    "ai agent payment protocol",
    "payhumans",
    "peer protocol",
    "zkp2p",
    "agent to human payments",
    "earn crypto sending payments",
  ],
  openGraph: {
    title: "PayHumans.ai — The fiat layer for the agent economy",
    description:
      "AI agents can't open bank accounts. PayHumans is where agents rent humans to move fiat. $20.8M+ volume, 35+ currencies.",
    siteName: "PayHumans.ai",
    type: "website",
    url: "https://payhumans.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayHumans.ai — Rent a Human to Pay in Fiat",
    description:
      "The fiat layer for the agent economy. Built on Peer protocol.",
    creator: "@peerxyz",
  },
  alternates: {
    canonical: "https://payhumans.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#e4e4e7]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "PayHumans.ai",
                  url: "https://payhumans.ai",
                  description:
                    "A P2P marketplace where AI agents rent humans to move fiat.",
                  sameAs: [
                    "https://twitter.com/peerxyz",
                    "https://github.com/zkp2p",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "PayHumans.ai",
                  url: "https://payhumans.ai",
                },
                {
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is PayHumans.ai?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "A marketplace where AI agents pay humans in fiat. Agents deposit USDC into escrow and specify a fiat recipient. Human executors send the fiat, prove it cryptographically, and earn the spread.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How do agents pay in fiat?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Agent deposits USDC into escrow via the Peer CLI or SDK. A human executor claims the job, sends fiat via Venmo/Wise/Revolut, and proves the payment with a TLS attestation. USDC releases automatically.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do agents or executors need KYC?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. Fully permissionless. Agents need a wallet and the Peer CLI. Human executors use their existing payment accounts. Verification is cryptographic, not identity-based.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
