"use client";

import { useState } from "react";
import { useWriteContract, useSwitchChain } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { hardhat } from "wagmi/chains";
import { useWalletContext } from "@/context/WalletContext";
import { getProjectTokenAddress, ERC20_ABI } from "@/lib/contracts";

type SendTokensParams = {
  fromWallet: string;
  toWallet: string;
  amount: string;
};

type SendResult =
  | { success: true; hash: string | undefined }
  | { success: false; error: string };

export function useSendTokens() {
  const { isDemo } = useWalletContext();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTokens = async (params: SendTokensParams): Promise<SendResult> => {
    const { toWallet, amount } = params;
    setError(null);

    if (!isAddress(toWallet)) {
      const msg = "Invalid recipient address";
      setError(msg);
      return { success: false, error: msg };
    }

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      const msg = "Amount must be greater than 0";
      setError(msg);
      return { success: false, error: msg };
    }

    setIsPending(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1000));
        return { success: true, hash: undefined };
      }

      const tokenAddress = getProjectTokenAddress();
      if (!tokenAddress) {
        const msg = "Token contract address not configured";
        setError(msg);
        return { success: false, error: msg };
      }

      await switchChainAsync({ chainId: hardhat.id });

      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [toWallet as `0x${string}`, parseUnits(amount, 18)],
        chainId: hardhat.id,
      });
      return { success: true, hash };
    } catch {
      const msg = "Transaction failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsPending(false);
    }
  };

  return { sendTokens, isPending, error };
}
