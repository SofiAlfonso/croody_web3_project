"use client";

import { useState } from "react";
import { useWriteContract, useSwitchChain, usePublicClient } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { ACTIVE_CHAIN } from "@/lib/chain";
import { useWalletContext } from "@/context/WalletContext";
import { useTxToast } from "@/context/TxToastContext";
import { getProjectTokenAddress, ERC20_ABI } from "@/lib/contracts";
import { savePendingTx } from "@/lib/transaction-store";

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
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const { addToast, updateToast } = useTxToast();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTokens = async (params: SendTokensParams): Promise<SendResult> => {
    const { fromWallet, toWallet, amount } = params;
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
        const toastId = addToast(`Sending ${amount} CRD...`, "pending");
        await new Promise((r) => setTimeout(r, 1000));
        updateToast(toastId, "confirmed", `${amount} CRD sent!`);
        return { success: true, hash: undefined };
      }

      const tokenAddress = getProjectTokenAddress();
      if (!tokenAddress) {
        const msg = "Token contract address not configured";
        setError(msg);
        return { success: false, error: msg };
      }

      await switchChainAsync({ chainId: ACTIVE_CHAIN.id });

      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [toWallet as `0x${string}`, parseUnits(amount, 18)],
        chainId: ACTIVE_CHAIN.id,
      });

      const toastId = addToast(`Sending ${amount} CRD...`, "pending", hash);

      savePendingTx({
        id: hash,
        type: "token_sent",
        hash: hash as `0x${string}`,
        from: fromWallet,
        to: toWallet,
        amount,
        walletAddress: fromWallet,
      });

      if (publicClient) {
        publicClient
          .waitForTransactionReceipt({ hash: hash as `0x${string}` })
          .then(() => updateToast(toastId, "confirmed", `${amount} CRD sent!`))
          .catch(() => updateToast(toastId, "failed", "Token transfer failed"));
      }

      return { success: true, hash };
    } catch {
      const msg = "Transaction failed";
      setError(msg);
      addToast(msg, "failed");
      return { success: false, error: msg };
    } finally {
      setIsPending(false);
    }
  };

  return { sendTokens, isPending, error };
}
