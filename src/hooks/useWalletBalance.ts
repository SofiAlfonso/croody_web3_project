"use client";

import { useMemo } from "react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useWalletContext } from "@/context/WalletContext";

type WalletBalanceResult = {
  amount: string;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
};

function formatBalance(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";

  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function useWalletBalance(): WalletBalanceResult {
  const { walletAddress, isConnected, isDemo } = useWalletContext();

  const address = useMemo(() => {
    if (!walletAddress || !walletAddress.startsWith("0x")) return undefined;
    return walletAddress as `0x${string}`;
  }, [walletAddress]);

  const { data, isLoading, isError } = useBalance({
    address,
    query: {
      enabled: Boolean(address) && isConnected && !isDemo,
      refetchInterval: 10_000,
    },
  });

  if (isDemo) {
    return {
      amount: "1,250",
      symbol: "CRD",
      isLoading: false,
      isError: false,
    };
  }

  if (!isConnected || !address) {
    return {
      amount: "0",
      symbol: "ETH",
      isLoading: false,
      isError: false,
    };
  }

  return {
    amount: data ? formatBalance(formatUnits(data.value, data.decimals)) : "0",
    symbol: data?.symbol ?? "ETH",
    isLoading,
    isError,
  };
}
