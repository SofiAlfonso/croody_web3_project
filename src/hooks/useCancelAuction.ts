"use client";

import { useState } from "react";
import { parseAbi } from "viem";
import { hardhat } from "wagmi/chains";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress } from "@/lib/contracts";

type CancelAuctionParams = {
  auctionId: string;
};

const NFT_MARKETPLACE_ABI = parseAbi([
  "function cancelAuction(uint256 auctionId) external",
]);

export function useCancelAuction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const cancelAuction = async (params: CancelAuctionParams) => {
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
        functionName: "cancelAuction",
        args: [BigInt(params.auctionId)],
        chainId: hardhat.id,
      });

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      return { success: true as const, txHash };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to cancel auction";
      setError(message);
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { cancelAuction, isPending, error };
}
