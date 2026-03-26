import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayHumans.ai — Rent a human to pay in fiat",
  description:
    "AI agents hold crypto but the world runs on fiat. PayHumans connects agents with human LPs to bridge the gap. 88 CLI commands. 18+ platforms. Permissionless.",
  openGraph: {
    title: "PayHumans.ai — The fiat layer for the agent economy",
    description:
      "AI agents can't open bank accounts. PayHumans is where agents rent humans to move fiat. $20M+ volume, 35+ currencies.",
    siteName: "PayHumans.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayHumans.ai — Rent a human to pay in fiat",
    description:
      "The fiat layer for the agent economy. Built on Peer protocol.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
