"use client";

import { useState } from "react";
import { parseEther, parseAbi } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// TODO: Update these with your deployed contract addresses
const DEMO_NFT_COLLECTION = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DEMO_NFT_MARKETPLACE = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace if you deployed it

const NFT_COLLECTION_ABI = parseAbi([
  "function approve(address to, uint256 tokenId) external",
]);

const NFT_MARKETPLACE_ABI = parseAbi([
  "function createAuction(address nftContract, uint256 tokenId, uint256 startPrice, uint256 duration) external returns (uint256)"
]);

type CreateAuctionParams = {
  nftId: string;
  minimumBid: string;
  durationHours: number;
};

export function useCreateAuction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const createAuction = async (_params: CreateAuctionParams) => {
    setIsPending(true);
    setError(null);

    try {
      // 1. Approve the marketplace to handle the NFT
      const approveTxHash = await writeContractAsync({
        address: DEMO_NFT_COLLECTION,
        abi: NFT_COLLECTION_ABI,
        functionName: "approve",
        args: [DEMO_NFT_MARKETPLACE, BigInt(_params.nftId)],
      });

      console.log("Approval tx sent:", approveTxHash);
      // In a production app, you might wait for the approval receipt here using publicClient before proceeding.

      // 2. Create the auction on the marketplace contract
      const startPriceTokens = parseEther(_params.minimumBid); // Assuming minimum bid is in 18 decimals token
      const durationSeconds = BigInt(_params.durationHours * 3600);

      const createTxHash = await writeContractAsync({
        address: DEMO_NFT_MARKETPLACE,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "createAuction",
        args: [DEMO_NFT_COLLECTION, BigInt(_params.nftId), startPriceTokens, durationSeconds],
      });

      console.log("Create Auction tx sent:", createTxHash);

      return { success: true as const, txHash: createTxHash };
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to create auction");
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { createAuction, isPending, error };
}
