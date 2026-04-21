"use client";

import { useState, useEffect } from "react";
import { createPublicClient, http, formatUnits } from "viem";
import { hardhat } from "viem/chains";
import { useWalletContext } from "@/context/WalletContext";
import { formatBalance } from "@/lib/balance-utils";
import { getProjectTokenAddress, ERC20_ABI } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

type WalletBalanceResult = {
  amount: string;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
};

export function useWalletBalance(): WalletBalanceResult {
  const { walletAddress, isConnected, isDemo } = useWalletContext();
  const [data, setData] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const address =
    walletAddress && walletAddress.startsWith("0x")
      ? (walletAddress as `0x${string}`)
      : undefined;

  useEffect(() => {
    if (!address || !isConnected || isDemo) return;

    const tokenAddress = getProjectTokenAddress();
    if (!tokenAddress) return;

    const fetchBalance = async () => {
      try {
        const result = await publicClient.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        setData(result as bigint);
        setIsError(false);
      } catch {
        setIsError(true);
      }
    };

    setIsLoading(true);
    fetchBalance().finally(() => setIsLoading(false));

    const interval = setInterval(fetchBalance, 10_000);
    return () => clearInterval(interval);
  }, [address, isConnected, isDemo]);

  if (isDemo) {
    return { amount: "1,250", symbol: "CRD", isLoading: false, isError: false };
  }

  if (!isConnected || !address) {
    return { amount: "0", symbol: "CRD", isLoading: false, isError: false };
  }

  return {
    amount: data ? formatBalance(formatUnits(data, 18)) : "0",
    symbol: "CRD",
    isLoading,
    isError,
  };
}
