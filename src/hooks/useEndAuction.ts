"use client";

import { useState } from "react";
import { parseAbi } from "viem";
import { hardhat } from "wagmi/chains";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress } from "@/lib/contracts";

type EndAuctionParams = {
  auctionId: string;
};

const NFT_MARKETPLACE_ABI = parseAbi([
  "function endAuction(uint256 auctionId) external",
]);

export function useEndAuction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const endAuction = async (params: EndAuctionParams) => {
    setIsPending(true);
    setError(null);

    try {
      const marketplaceAddress = getMarketplaceAddress();
      if (!marketplaceAddress) {
        throw new Error("Marketplace contract address is not configured");
      }

      await switchChainAsync({ chainId: hardhat.id });

      const txHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "endAuction",
        args: [BigInt(params.auctionId)],
        chainId: hardhat.id,
      });

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      return { success: true as const, txHash };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to close auction";
      setError(message);
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { endAuction, isPending, error };
}
