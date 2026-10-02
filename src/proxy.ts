import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
    "img-src 'self' data: blob: https://auth.privy.io https://*.privy.io",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://*.hcaptcha.com",
    "connect-src 'self' https://auth.privy.io https://*.rpc.privy.systems https://mainnet.base.org https://*.zkp2p.xyz https://*.zkp2p.dev https://*.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com https://explorer-api.walletconnect.com wss://relay.walletconnect.com wss://relay.walletconnect.org" +
      (dev ? " ws://127.0.0.1:3100" : ""),
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
export const config = { matcher: "/earn/:path*" };
