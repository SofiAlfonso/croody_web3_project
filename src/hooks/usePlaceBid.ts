"use client";

import { useState } from "react";
import { parseAbi, parseEther } from "viem";
import { ACTIVE_CHAIN } from "@/lib/chain";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { getMarketplaceAddress, getProjectTokenAddress } from "@/lib/contracts";
import { useWalletContext } from "@/context/WalletContext";
import { useTxToast } from "@/context/TxToastContext";
import { savePendingTx } from "@/lib/transaction-store";

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
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const { walletAddress } = useWalletContext();
  const { addToast, updateToast } = useTxToast();

  const placeBid = async (params: PlaceBidParams) => {
    setIsPending(true);
    setError(null);

    const toastId = addToast("Approving tokens...", "pending");

    try {
      const tokenAddress = getProjectTokenAddress();
      const marketplaceAddress = getMarketplaceAddress();
      if (!tokenAddress || !marketplaceAddress) {
        throw new Error("Contract addresses are not configured");
      }

      await switchChainAsync({ chainId: ACTIVE_CHAIN.id });

      const bidAmount = parseEther(params.amount);
      const auctionId = BigInt(params.auctionId);

      const approveTxHash = await writeContractAsync({
        address: tokenAddress,
        abi: PROJECT_TOKEN_ABI,
        functionName: "approve",
        args: [marketplaceAddress, bidAmount],
        chainId: ACTIVE_CHAIN.id,
      });

      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

      updateToast(toastId, "pending", "Placing bid...");

      const bidTxHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "placeBid",
        args: [auctionId, bidAmount],
        chainId: ACTIVE_CHAIN.id,
      });

      updateToast(toastId, "pending", "Placing bid...", bidTxHash);

      savePendingTx({
        id: bidTxHash,
        type: "bid_placed",
        hash: bidTxHash as `0x${string}`,
        from: walletAddress ?? "",
        to: marketplaceAddress,
        amount: params.amount,
        auctionId: params.auctionId,
        walletAddress: walletAddress ?? "",
      });

      publicClient
        .waitForTransactionReceipt({ hash: bidTxHash as `0x${string}` })
        .then(() => updateToast(toastId, "confirmed", `Bid of ${params.amount} CRD placed!`))
        .catch(() => updateToast(toastId, "failed", "Bid transaction failed"));

      return { success: true as const, txHash: bidTxHash };
    } catch {
      setError("Failed to place bid");
      updateToast(toastId, "failed", "Failed to place bid");
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { placeBid, isPending, error };
}
