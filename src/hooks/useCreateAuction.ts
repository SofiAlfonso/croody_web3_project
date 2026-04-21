"use client";

import { useState } from "react";
import { decodeEventLog, parseAbi, parseAbiItem, parseEther } from "viem";
import { usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { hardhat } from "wagmi/chains";
import { getMarketplaceAddress, getNftCollectionAddress } from "@/lib/contracts";

const NFT_COLLECTION_ABI = parseAbi([
  "function approve(address to, uint256 tokenId) external",
]);

const NFT_MARKETPLACE_ABI = parseAbi([
  "function createAuction(address nftContract, uint256 tokenId, uint256 startPrice, uint256 duration) external returns (uint256)"
]);

const AUCTION_CREATED_EVENT = parseAbiItem(
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, address nftContract, uint256 tokenId, uint256 startPrice, uint256 endTime)",
);

type CreateAuctionParams = {
  nftId: string;
  minimumBid: string;
  durationHours: number;
};

export function useCreateAuction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const createAuction = async (_params: CreateAuctionParams) => {
    setIsPending(true);
    setError(null);

    try {
      const nftCollection = getNftCollectionAddress();
      const marketplace = getMarketplaceAddress();
      if (!nftCollection || !marketplace) {
        throw new Error("Contract addresses are not configured");
      }

      await switchChainAsync({ chainId: hardhat.id });

      // 1. Approve the marketplace to handle the NFT
      const approveTxHash = await writeContractAsync({
        address: nftCollection,
        abi: NFT_COLLECTION_ABI,
        functionName: "approve",
        args: [marketplace, BigInt(_params.nftId)],
        chainId: hardhat.id,
      });
      if (!publicClient) throw new Error("Public client not available");
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

      // 2. Create the auction on the marketplace contract
      const startPriceTokens = parseEther(_params.minimumBid);
      const durationSeconds = BigInt(_params.durationHours * 3600);

      const createTxHash = await writeContractAsync({
        address: marketplace,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "createAuction",
        args: [nftCollection, BigInt(_params.nftId), startPriceTokens, durationSeconds],
        chainId: hardhat.id,
      });

      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      let auctionId: string | undefined;

      for (const log of createReceipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [AUCTION_CREATED_EVENT],
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "AuctionCreated" && typeof decoded.args.auctionId === "bigint") {
            auctionId = decoded.args.auctionId.toString();
            break;
          }
        } catch {
          // Ignore unrelated logs.
        }
      }

      return { success: true as const, txHash: createTxHash, auctionId };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create auction";
      setError(message);
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { createAuction, isPending, error };
}
