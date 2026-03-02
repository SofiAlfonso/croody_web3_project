"use client";

import { useState } from "react";
import Link from "next/link";
import { useNftById } from "@/hooks/useNfts";
import { useCreateAuction } from "@/hooks/useCreateAuction";
import { useTransferNft } from "@/hooks/useTransferNft";

interface NftDetailProps {
  id: string;
}

export default function NftDetail({ id }: NftDetailProps) {
  const { data: nft } = useNftById(id);
  const { createAuction, isPending: isCreatingAuction } = useCreateAuction();
  const { transferNft, isPending: isTransferringNft } = useTransferNft();
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  if (!nft) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold text-neutral-900">NFT Details</div>
            <Link className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900" href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
            <div className="text-lg font-semibold text-neutral-900">NFT not found</div>
            <div className="text-sm text-neutral-500 mt-2">Try another NFT from the dashboard.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-neutral-900">NFT Details</div>
          <Link className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="aspect-square bg-neutral-100">
            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-semibold text-neutral-900">{nft.name}</div>
            <div className="text-sm text-neutral-500 mt-2">Token ID: {nft.id}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="text-sm text-neutral-500">Collection</div>
            <div className="text-lg font-semibold text-neutral-900">Croody Genesis</div>
            <div className="mt-4 text-sm text-neutral-600">
              This artifact grants VIP access to Croody auctions and future drops.
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <div className="text-sm text-neutral-500">Owner Actions</div>
            <button
              className="w-full px-5 py-3 rounded-lg bg-gator-100 text-gator-700 text-sm hover:bg-gator-300 transition-colors text-center"
              type="button"
              onClick={() => setIsAuctionDialogOpen(true)}
            >
              Put NFT in Auction
            </button>
            <button
              className="w-full px-5 py-3 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50"
              type="button"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              Transfer NFT
            </button>
          </div>
        </div>
      </main>

      {isAuctionDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-neutral-900">Create Auction</div>
            <div className="mt-1 text-sm text-neutral-500">Set the minimum bid and time limit.</div>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                type="button"
                onClick={() => setIsAuctionDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-gator-500 px-4 py-2 text-sm text-white hover:bg-gator-700"
                type="button"
                disabled={isCreatingAuction}
                onClick={async () => {
                  // TODO: Wire minimum bid/duration inputs from dialog form state.
                  await createAuction({
                    nftId: nft.id,
                    minimumBid: "100",
                    durationHours: 24,
                  });
                  setIsAuctionDialogOpen(false);
                }}
              >
                {isCreatingAuction ? "Creating..." : "Create Auction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTransferDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-neutral-900">Transfer NFT</div>
            <div className="mt-1 text-sm text-neutral-500">Enter the recipient wallet address.</div>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                type="button"
                onClick={() => setIsTransferDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-gator-500 px-4 py-2 text-sm text-white hover:bg-gator-700"
                type="button"
                disabled={isTransferringNft}
                onClick={async () => {
                  // TODO: Wire recipient wallet input from dialog form state.
                  await transferNft({
                    nftId: nft.id,
                    toWallet: "0xB7a...4C2",
                  });
                  setIsTransferDialogOpen(false);
                }}
              >
                {isTransferringNft ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}