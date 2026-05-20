"use client";

import { useState } from "react";
import { parseAbi } from "viem";
import { ACTIVE_CHAIN } from "@/lib/chain";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress } from "@/lib/contracts";
import { useTxToast } from "@/context/TxToastContext";

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
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const { addToast, updateToast } = useTxToast();

  const cancelAuction = async (params: CancelAuctionParams) => {
    setIsPending(true);
    setError(null);

    const toastId = addToast("Cancelling auction...", "pending");

    try {
      const marketplaceAddress = getMarketplaceAddress();
      if (!marketplaceAddress) {
        throw new Error("Marketplace contract address is not configured");
      }

      await switchChainAsync({ chainId: ACTIVE_CHAIN.id });

      const txHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "cancelAuction",
        args: [BigInt(params.auctionId)],
        chainId: ACTIVE_CHAIN.id,
      });

      updateToast(toastId, "pending", "Cancelling auction...", txHash);

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      updateToast(toastId, "confirmed", "Auction cancelled");
      return { success: true as const, txHash };
    } catch {
      setError("Failed to cancel auction");
      updateToast(toastId, "failed", "Failed to cancel auction");
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { cancelAuction, isPending, error };
}
