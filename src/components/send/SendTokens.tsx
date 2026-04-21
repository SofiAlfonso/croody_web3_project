"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSendTokens } from "@/hooks/useSendTokens";
import { useWalletContext } from "@/context/WalletContext";
import AppHeader from "@/components/shared/AppHeader";
import WalletBadge from "@/components/shared/WalletBadge";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";

export default function SendTokens() {
  const router = useRouter();
  const { walletAddress, isConnected } = useWalletContext();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { sendTokens, isPending: isSendingTokens } = useSendTokens();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const canSend = recipient.trim().length > 0 && amount.trim().length > 0 && !isSendingTokens;

  const handleSend = async () => {
    setFeedback(null);
    const result = await sendTokens({
      fromWallet: walletAddress!,
      toWallet: recipient,
      amount,
    });

    if (result.success) {
      setFeedback({
        type: "success",
        message: result.hash
          ? `Tokens sent! Tx: ${result.hash.slice(0, 10)}...`
          : "Tokens sent successfully",
      });
      setRecipient("");
      setAmount("");
    } else {
      setFeedback({ type: "error", message: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="Send Tokens" sticky maxWidthClassName="max-w-5xl" rightClassName="flex items-center gap-3">
        <BackToDashboardLink />
        <WalletBadge />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
          <div>
            <div className="mb-1 text-sm text-neutral-500">From Wallet</div>
            <div className="inline-flex items-center gap-3 rounded-lg bg-neutral-100 px-4 py-2 font-mono text-sm text-neutral-700">
              {shortWallet}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm text-neutral-600">Recipient Address</label>
              <input
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Amount (CRD)</label>
              <input
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                placeholder="0.00"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Network fee estimate: 0.002 CRD · Estimated arrival: ~30 seconds
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-neutral-200 px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              type="button"
              onClick={() => {
                setRecipient("");
                setAmount("");
                setFeedback(null);
              }}
            >
              Clear
            </button>
            <button
              className="bg-gator-100 text-gator-700 hover:bg-gator-300 inline-flex rounded-lg px-5 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!canSend}
              onClick={handleSend}
            >
              {isSendingTokens ? "Sending..." : "Send Tokens"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
