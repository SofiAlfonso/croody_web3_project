"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { TxToastProvider } from "@/context/TxToastContext";
import TxToastContainer from "@/components/shared/TxToastContainer";

const queryClient = new QueryClient();

export default function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TxToastProvider>
          {children}
          <TxToastContainer />
        </TxToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
