"use client";

import { useState } from "react";
import { useWriteContract, useSwitchChain } from "wagmi";
import { isAddress } from "viem";
import { hardhat } from "wagmi/chains";
import { useWalletContext } from "@/context/WalletContext";
import { getNftCollectionAddress } from "@/lib/contracts";

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
