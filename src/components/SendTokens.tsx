"use client";

import { useState } from "react";
import Link from "next/link";
import { useSendTokens } from "@/hooks/useSendTokens";

interface SendTokensProps {
  walletAddress?: string | null;
}

export default function SendTokens({ walletAddress = "0xA3f...92B" }: SendTokensProps) {
  const [recipient] = useState("0xB7a...4C2");
  const [amount] = useState("125");
  const { sendTokens, isPending: isSendingTokens } = useSendTokens();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-neutral-900">Send Tokens</div>
          <Link className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-6">
          <div>
            <div className="text-sm text-neutral-500 mb-1">From Wallet</div>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-neutral-100 rounded-lg text-sm font-mono text-neutral-700">
              {walletAddress}
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
              className="px-5 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-100"
              type="button"
            >
              {/* TODO: Save draft to local state/storage */}
              Save Draft
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-gator-100 text-gator-700 text-sm hover:bg-gator-300 transition-colors inline-flex"
              type="button"
              disabled={isSendingTokens}
              onClick={async () => {
                await sendTokens({
                  fromWallet: walletAddress,
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