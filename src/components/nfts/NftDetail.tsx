"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, TrendingUp, Layers, ExternalLink } from "lucide-react";
import { useNftById } from "@/hooks/useNfts";
import { useCreateAuction } from "@/hooks/useCreateAuction";
import { useTransferNft } from "@/hooks/useTransferNft";
import AppHeader from "@/components/shared/AppHeader";
import NotFoundState from "@/components/shared/NotFoundState";
import ActionModal from "@/components/shared/ActionModal";

interface NftDetailProps {
  readonly id: string;
}

export default function NftDetail({ id }: NftDetailProps) {
  const { data: nft, isLoading } = useNftById(id);
  const { createAuction, isPending: isCreatingAuction } = useCreateAuction();
  const { transferNft, isPending: isTransferringNft } = useTransferNft();
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [auctionMinBid, setAuctionMinBid] = useState("100");
  const [transferToWallet, setTransferToWallet] = useState("");

  const rarityColor = (rarity?: string) => {
    if (!rarity) return "bg-jungle-50 text-jungle-500";
    const pct = Number.parseInt(rarity);
    if (pct <= 3) return "bg-yellow-100 text-yellow-700";
    if (pct <= 7) return "bg-purple-100 text-purple-700";
    if (pct <= 12) return "bg-gator-100 text-gator-700";
    return "bg-jungle-50 text-jungle-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="NFT Details" sticky>
          <Link
            href="/nfts"
            className="flex items-center gap-1.5 text-sm text-jungle-500 hover:text-jungle-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </AppHeader>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="bg-white border border-jungle-100 rounded-2xl p-8 text-center text-jungle-500">
            Loading NFT details...
          </div>
        </main>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="NFT Details" sticky>
          <Link
            href="/nfts"
            className="flex items-center gap-1.5 text-sm text-jungle-500 hover:text-jungle-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
        </AppHeader>
        <NotFoundState
          title="NFT not found"
          description="This NFT doesn't exist or hasn't been minted yet."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader
        title="NFT Details"
        sticky
        maxWidthClassName="max-w-7xl"
        borderClassName="border-jungle-100"
        titleClassName="text-jungle-900"
        rightClassName="flex items-center gap-3"
      >
        <Link
          href="/nfts"
          className="flex items-center gap-1.5 text-sm text-jungle-500 hover:text-jungle-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </AppHeader>

      <main className="max-w-7xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Left: Image */}
        <div className="space-y-4">
          <div className="bg-white border border-jungle-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-jungle-50">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Floor Price Card */}
          {nft.floorPrice && (
            <div className="bg-white border border-jungle-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gator-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gator-700" />
                </div>
                <div>
                  <div className="text-xs text-jungle-400">Floor Price</div>
                  <div className="text-xl font-bold text-jungle-900">{nft.floorPrice} CRD</div>
                </div>
              </div>
              <div className="text-xs text-jungle-400 bg-jungle-50 px-3 py-1.5 rounded-full">
                Collection floor
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-5">
          {/* Title + Collection */}
          <div className="bg-white border border-jungle-100 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold text-jungle-900 mb-1">{nft.name}</div>
                <div className="text-sm text-jungle-400 font-mono">Token ID: #{nft.id}</div>
              </div>
              <button
                type="button"
                className="shrink-0 text-jungle-400 hover:text-gator-600 transition-colors"
                title="View on block explorer (coming soon)"
                disabled
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            {nft.collection && (
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-gator-500" />
                <span className="text-sm font-medium text-gator-700">{nft.collection}</span>
              </div>
            )}

            {nft.description && (
              <p className="text-sm text-jungle-600 leading-relaxed">{nft.description}</p>
            )}
          </div>

          {/* Traits */}
          {nft.traits && nft.traits.length > 0 && (
            <div className="bg-white border border-jungle-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-jungle-500" />
                <span className="text-sm font-semibold text-jungle-900">Traits</span>
                <span className="ml-auto text-xs text-jungle-400">{nft.traits.length} attributes</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {nft.traits.map((trait) => (
                  <div
                    key={`${trait.type}-${trait.value}`}
                    className="border border-jungle-100 rounded-xl p-3 bg-jungle-50/50"
                  >
                    <div className="text-xs text-jungle-400 uppercase tracking-wide mb-1">{trait.type}</div>
                    <div className="text-sm font-semibold text-jungle-900">{trait.value}</div>
                    {trait.rarity && (
                      <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${rarityColor(trait.rarity)}`}>
                        {trait.rarity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Actions */}
          <div className="bg-white border border-jungle-100 rounded-2xl p-6 space-y-3">
            <div className="text-sm font-semibold text-jungle-900 mb-2">Owner Actions</div>
            <button
              className="w-full px-5 py-3 rounded-xl bg-gator-500 text-white text-sm font-medium hover:bg-gator-700 transition-colors"
              type="button"
              onClick={() => setIsAuctionDialogOpen(true)}
            >
              Put NFT in Auction
            </button>
            <button
              className="w-full px-5 py-3 rounded-xl border border-jungle-200 text-sm text-jungle-700 hover:bg-jungle-50 transition-colors"
              type="button"
              onClick={() => setIsTransferDialogOpen(true)}
            >
              Transfer NFT
            </button>
          </div>
        </div>
      </main>

      {/* Auction Modal */}
      <ActionModal
        isOpen={isAuctionDialogOpen}
        title="Create Auction"
        description="Set the minimum bid for your NFT auction."
        cancelLabel="Cancel"
        confirmLabel="Create Auction"
        isConfirming={isCreatingAuction}
        onCancel={() => setIsAuctionDialogOpen(false)}
        onConfirm={async () => {
          await createAuction({
            nftId: nft.id,
            minimumBid: auctionMinBid,
            durationHours: 24,
          });
          setIsAuctionDialogOpen(false);
        }}
      >
        <div className="mt-3">
          <label htmlFor="auction-min-bid" className="block text-sm text-jungle-600 mb-1">
            Minimum Bid (CRD)
          </label>
          <input
            id="auction-min-bid"
            type="number"
            min="1"
            value={auctionMinBid}
            onChange={(e) => setAuctionMinBid(e.target.value)}
            className="w-full px-3 py-2 border border-jungle-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gator-300"
          />
        </div>
      </ActionModal>

      {/* Transfer Modal */}
      <ActionModal
        isOpen={isTransferDialogOpen}
        title="Transfer NFT"
        description="Enter the recipient's wallet address."
        cancelLabel="Cancel"
        confirmLabel="Transfer"
        isConfirming={isTransferringNft}
        onCancel={() => setIsTransferDialogOpen(false)}
        onConfirm={async () => {
          await transferNft({
            nftId: nft.id,
            toWallet: transferToWallet || "0xB7a...4C2",
          });
          setIsTransferDialogOpen(false);
        }}
      >
        <div className="mt-3">
          <label htmlFor="transfer-to-wallet" className="block text-sm text-jungle-600 mb-1">
            Recipient Wallet Address
          </label>
          <input
            id="transfer-to-wallet"
            type="text"
            placeholder="0x..."
            value={transferToWallet}
            onChange={(e) => setTransferToWallet(e.target.value)}
            className="w-full px-3 py-2 border border-jungle-100 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gator-300"
          />
        </div>
      </ActionModal>
    </div>
  );
}