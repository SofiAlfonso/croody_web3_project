"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSendTokens } from "@/hooks/useSendTokens";
import { useWalletContext } from "@/context/WalletContext";
import AppHeader from "@/components/shared/AppHeader";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";

export default function SendTokens() {
  const router = useRouter();
  const { walletAddress, isConnected } = useWalletContext();
  const [recipient] = useState("0xB7a...4C2");
  const [amount] = useState("125");
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="Send Tokens" sticky maxWidthClassName="max-w-5xl">
        <BackToDashboardLink />
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
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                placeholder="0x..."
                readOnly
                value={recipient}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Amount (CRD)</label>
              <input
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                placeholder="0.00"
                readOnly
                value={amount}
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Network fee estimate: 0.002 CRD · Estimated arrival: ~30 seconds
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-neutral-200 px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              type="button"
            >
              Save Draft
            </button>
            <button
              className="bg-gator-100 text-gator-700 hover:bg-gator-300 inline-flex rounded-lg px-5 py-2 text-sm transition-colors"
              type="button"
              disabled={isSendingTokens}
              onClick={async () => {
                await sendTokens({
                  fromWallet: walletAddress!,
                  toWallet: recipient,
                  amount,
                });
              }}
            >
              {isSendingTokens ? "Sending..." : "Send Tokens"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
