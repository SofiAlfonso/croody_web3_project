"use client";

import { useState } from "react";
import { parseAbi, parseEther } from "viem";
import { hardhat } from "wagmi/chains";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress, getProjectTokenAddress } from "@/lib/contracts";

type PlaceBidParams = {
  auctionId: string;
  amount: string;
};

const PROJECT_TOKEN_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

const NFT_MARKETPLACE_ABI = parseAbi([
  "function placeBid(uint256 auctionId, uint256 amount) external",
]);

export function usePlaceBid() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const placeBid = async (params: PlaceBidParams) => {
    setIsPending(true);
    setError(null);

    try {
      const tokenAddress = getProjectTokenAddress();
      const marketplaceAddress = getMarketplaceAddress();
      if (!tokenAddress || !marketplaceAddress) {
        throw new Error("Contract addresses are not configured");
      }

      await switchChainAsync({ chainId: hardhat.id });

      const bidAmount = parseEther(params.amount);
      const auctionId = BigInt(params.auctionId);

      const approveTxHash = await writeContractAsync({
        address: tokenAddress,
        abi: PROJECT_TOKEN_ABI,
        functionName: "approve",
        args: [marketplaceAddress, bidAmount],
        chainId: hardhat.id,
      });

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

      const bidTxHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "placeBid",
        args: [auctionId, bidAmount],
        chainId: hardhat.id,
      });

      return { success: true as const, txHash: bidTxHash };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to place bid";
      setError(message);
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { placeBid, isPending, error };
}
