"use client";

import { useState } from "react";
import { parseAbi } from "viem";
import { ACTIVE_CHAIN } from "@/lib/chain";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress } from "@/lib/contracts";
import { useTxToast } from "@/context/TxToastContext";

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
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const { addToast, updateToast } = useTxToast();

  const endAuction = async (params: EndAuctionParams) => {
    setIsPending(true);
    setError(null);

    const toastId = addToast("Closing auction...", "pending");

    try {
      const marketplaceAddress = getMarketplaceAddress();
      if (!marketplaceAddress) {
        throw new Error("Marketplace contract address is not configured");
      }

      await switchChainAsync({ chainId: ACTIVE_CHAIN.id });

      const txHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "endAuction",
        args: [BigInt(params.auctionId)],
        chainId: ACTIVE_CHAIN.id,
      });

      updateToast(toastId, "pending", "Closing auction...", txHash);

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      updateToast(toastId, "confirmed", "Auction closed!");
      return { success: true as const, txHash };
    } catch {
      setError("Failed to close auction");
      updateToast(toastId, "failed", "Failed to close auction");
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { endAuction, isPending, error };
}
