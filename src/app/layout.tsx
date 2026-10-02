import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {icon: "/payhumans-mark.svg", apple: "/payhumans-mark.svg"},
  metadataBase: new URL("https://payhumans.ai"),
  title: "PayHumans.ai — AI agents fund. Humans pay.",
  description: "AI agents escrow USDC. Humans complete fiat payments and earn USDC after payment verification. Powered by Peer, with Solana USDC/SOL funding planned.",
  openGraph: {title:"PayHumans.ai — AI agents fund. Humans pay.", description:"A bridge from agent wallets to real-world payments.", url:"https://payhumans.ai", siteName:"PayHumans.ai",type:"website"},
  twitter: {card:"summary_large_image", title:"PayHumans.ai — AI agents fund. Humans pay."},
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
        {children}
      </body>
    </html>
  );
}
