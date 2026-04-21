"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useWalletContext } from "@/context/WalletContext";
import { formatBalance } from "@/lib/balance-utils";
import deployedAddresses from "@/lib/deployed-addresses.json";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

type WalletBalanceResult = {
  amount: string;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
};

export function useWalletBalance(): WalletBalanceResult {
  const { walletAddress, isConnected, isDemo } = useWalletContext();

  const address = useMemo(() => {
    if (!walletAddress || !walletAddress.startsWith("0x")) return undefined;
    return walletAddress as `0x${string}`;
  }, [walletAddress]);

  const { data, isLoading, isError } = useReadContract({
    address: deployedAddresses.contracts.projectToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
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
      symbol: "CRD",
      isLoading: false,
      isError: false,
    };
  }

  return {
    amount: data ? formatBalance(formatUnits(data as bigint, 18)) : "0",
    symbol: "CRD",
    isLoading,
    isError,
  };
}
