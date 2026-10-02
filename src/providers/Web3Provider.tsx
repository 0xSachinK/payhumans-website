"use client";
import {
  PrivyProvider,
  useWallets,
  type PrivyClientConfig,
} from "@privy-io/react-auth";
import {
  WagmiProvider,
  createConfig,
  useSetActiveWallet,
} from "@privy-io/wagmi";
import { http, useAccount } from "wagmi";
import { base } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState, useEffect } from "react";
export const PAYHUMANS_PRIVY_CONFIG = {
  appearance: {
    theme: "dark",
    accentColor: "#7c3aed",
    landingHeader: "Your PayHumans wallet",
    loginMessage: "Sign in with a passkey or email to claim payment jobs.",
    showWalletLoginFirst: false,
  },
  loginMethods: ["passkey", "email"],
  defaultChain: base,
  supportedChains: [base],
  embeddedWallets: {
    ethereum: { createOnLogin: "all-users" },
    // The claim and intent screens already show a review step before every transaction.
    showWalletUIs: false,
  },
  externalWallets: {
    disableAllExternalWallets: true,
    walletConnect: { enabled: false },
  },
} satisfies PrivyClientConfig;
const config = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [base],
  transports: { [base.id]: http("https://mainnet.base.org") },
  ssr: true,
});
function EmbeddedWalletSelection() {
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  useEffect(() => {
    if (embedded && embedded.address.toLowerCase() !== address?.toLowerCase())
      void setActiveWallet(embedded);
  }, [embedded, address, setActiveWallet]);
  return null;
}
export default function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId)
    return (
      <div className="p-12 pt-32">
        Wallet sign-in is temporarily unavailable. Please try again shortly.
      </div>
    );
  return (
    <PrivyProvider appId={appId} config={PAYHUMANS_PRIVY_CONFIG}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <EmbeddedWalletSelection />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
