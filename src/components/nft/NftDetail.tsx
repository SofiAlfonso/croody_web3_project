"use client";

import { useState } from "react";
import { useNftById } from "@/hooks/useNfts";
import { useCreateAuction } from "@/hooks/useCreateAuction";
import { useTransferNft } from "@/hooks/useTransferNft";
import AppHeader from "@/components/shared/AppHeader";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";
import NotFoundState from "@/components/shared/NotFoundState";
import ActionModal from "@/components/shared/ActionModal";

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
        <AppHeader title="NFT Details" sticky>
          <BackToDashboardLink />
        </AppHeader>
        <NotFoundState
          title="NFT not found"
          description="Try another NFT from the dashboard."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="NFT Details" sticky>
        <BackToDashboardLink />
      </AppHeader>

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

      <ActionModal
        isOpen={isAuctionDialogOpen}
        title="Create Auction"
        description="Set the minimum bid and time limit."
        cancelLabel="Cancel"
        confirmLabel="Create Auction"
        isConfirming={isCreatingAuction}
        onCancel={() => setIsAuctionDialogOpen(false)}
        onConfirm={async () => {
          // TODO: Wire minimum bid/duration inputs from dialog form state.
          await createAuction({
            nftId: nft.id,
            minimumBid: "100",
            durationHours: 24,
          });
          setIsAuctionDialogOpen(false);
        }}
      />

      <ActionModal
        isOpen={isTransferDialogOpen}
        title="Transfer NFT"
        description="Enter the recipient wallet address."
        cancelLabel="Cancel"
        confirmLabel="Transfer"
        isConfirming={isTransferringNft}
        onCancel={() => setIsTransferDialogOpen(false)}
        onConfirm={async () => {
          // TODO: Wire recipient wallet input from dialog form state.
          await transferNft({
            nftId: nft.id,
            toWallet: "0xB7a...4C2",
          });
          setIsTransferDialogOpen(false);
        }}
      />
    </div>
  );
}