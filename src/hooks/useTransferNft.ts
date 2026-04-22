"use client";

import { useState } from "react";
import { useWriteContract, useSwitchChain } from "wagmi";
import { isAddress, createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { useWalletContext } from "@/context/WalletContext";
import { getNftCollectionAddress, getMarketplaceAddress } from "@/lib/contracts";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"),
});

const NFT_ABI = [
  {
    name: "safeTransferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const MARKETPLACE_ABI = [
  {
    name: "getAllActiveAuctions",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "auctionId", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "startPrice", type: "uint256" },
          { name: "highestBid", type: "uint256" },
          { name: "highestBidder", type: "address" },
          { name: "endTime", type: "uint256" },
          { name: "ended", type: "bool" },
          { name: "cancelled", type: "bool" },
        ],
      },
    ],
  },
] as const;

type AuctionView = {
  nftContract: `0x${string}`;
  tokenId: bigint;
};

type TransferNftParams = {
  nftId: string;
  toWallet: string;
};

type TransferResult =
  | { success: true; hash: string }
  | { success: false; error: string };

export function useTransferNft() {
  const { walletAddress, isDemo } = useWalletContext();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferNft = async (params: TransferNftParams): Promise<TransferResult> => {
    const { nftId, toWallet } = params;
    setError(null);

    if (!isAddress(toWallet)) {
      const msg = "Invalid recipient address";
      setError(msg);
      return { success: false, error: msg };
    }

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      const msg = "Wallet not connected";
      setError(msg);
      return { success: false, error: msg };
    }

    setIsPending(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1000));
        return { success: true, hash: "0xdemo" };
      }

      const nftAddress = getNftCollectionAddress();
      if (!nftAddress) {
        const msg = "NFT contract address not configured";
        setError(msg);
        return { success: false, error: msg };
      }

      const marketplaceAddress = getMarketplaceAddress();
      if (marketplaceAddress) {
        const activeAuctions = (await publicClient.readContract({
          address: marketplaceAddress,
          abi: MARKETPLACE_ABI,
          functionName: "getAllActiveAuctions",
        })) as unknown as AuctionView[];

        const isInAuction = activeAuctions.some(
          (a) =>
            a.nftContract.toLowerCase() === nftAddress.toLowerCase() &&
            a.tokenId.toString() === nftId,
        );

        if (isInAuction) {
          const msg = "This NFT is in an active auction and cannot be transferred";
          setError(msg);
          return { success: false, error: msg };
        }
      }

      await switchChainAsync({ chainId: hardhat.id });

      const hash = await writeContractAsync({
        address: nftAddress,
        abi: NFT_ABI,
        functionName: "safeTransferFrom",
        args: [walletAddress as `0x${string}`, toWallet as `0x${string}`, BigInt(nftId)],
        chainId: hardhat.id,
      });

      return { success: true, hash };
    } catch {
      const msg = "Failed to transfer NFT";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsPending(false);
    }
  };

  return { transferNft, isPending, error };
}
