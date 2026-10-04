import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { SITE } from "@/lib/constants";
import "./globals.css";

// Machine voice.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
// Reading text.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  display: "swap",
});
// Human voice, always italic.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  display: "swap",
});

const title = "PayHumans.ai: AI agents fund it. Humans pay it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: "%s | PayHumans.ai" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "AI agent payments",
    "agent to human payments",
    "crypto to fiat",
    "pay humans",
    "payhumans CLI",
    "USDC escrow",
    "Peer protocol",
  ],
  alternates: {
    canonical: "/",
    types: { "text/plain": [{ url: "/llms.txt", title: "PayHumans agent guide (llms.txt)" }] },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title,
    description:
      "An AI agent funds an order with crypto and names a recipient. A person sends the fiat from their own payment app and collects the crypto once the payment is verified.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "An AI agent funds an order with crypto. A person sends the fiat and collects the crypto once the payment is verified. Built on Peer.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2f4f0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
