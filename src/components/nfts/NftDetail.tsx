"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: nft, isLoading } = useNftById(id);
  const { createAuction, isPending: isCreatingAuction } = useCreateAuction();
  const { transferNft, isPending: isTransferringNft, error: transferNftError } = useTransferNft();
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [auctionMinBid, setAuctionMinBid] = useState("100");
  const [auctionDuration, setAuctionDuration] = useState("24");
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
            className="text-jungle-500 hover:text-jungle-900 flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>
        </AppHeader>
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="border-jungle-100 text-jungle-500 rounded-2xl border bg-white p-8 text-center">
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
            className="text-jungle-500 hover:text-jungle-900 flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
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
          className="text-jungle-500 hover:text-jungle-900 flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
      </AppHeader>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_1fr]">
        {/* Left: Image */}
        <div className="space-y-4">
          <div className="border-jungle-100 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="bg-jungle-50 relative aspect-square">
              <Image src={nft.image} alt={nft.name} className="h-full w-full object-cover" fill />
            </div>
          </div>

          {/* Floor Price Card */}
          {nft.floorPrice && (
            <div className="border-jungle-100 flex items-center justify-between rounded-2xl border bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="bg-gator-100 flex h-10 w-10 items-center justify-center rounded-xl">
                  <TrendingUp className="text-gator-700 h-5 w-5" />
                </div>
                <div>
                  <div className="text-jungle-400 text-xs">Floor Price</div>
                  <div className="text-jungle-900 text-xl font-bold">{nft.floorPrice} CRD</div>
                </div>
              </div>
              <div className="text-jungle-400 bg-jungle-50 rounded-full px-3 py-1.5 text-xs">
                Collection floor
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-5">
          {/* Title + Collection */}
          <div className="border-jungle-100 rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-jungle-900 mb-1 text-3xl font-bold">{nft.name}</div>
                <div className="text-jungle-400 font-mono text-sm">Token ID: #{nft.id}</div>
              </div>
              <button
                type="button"
                className="text-jungle-400 hover:text-gator-600 shrink-0 transition-colors"
                title="View on block explorer (coming soon)"
                disabled
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>

            {nft.collection && (
              <div className="mb-4 flex items-center gap-2">
                <Layers className="text-gator-500 h-4 w-4" />
                <span className="text-gator-700 text-sm font-medium">{nft.collection}</span>
              </div>
            )}

            {nft.description && (
              <p className="text-jungle-600 text-sm leading-relaxed">{nft.description}</p>
            )}
          </div>

          {/* Traits */}
          {nft.traits && nft.traits.length > 0 && (
            <div className="border-jungle-100 rounded-2xl border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="text-jungle-500 h-4 w-4" />
                <span className="text-jungle-900 text-sm font-semibold">Traits</span>
                <span className="text-jungle-400 ml-auto text-xs">
                  {nft.traits.length} attributes
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {nft.traits.map((trait) => (
                  <div
                    key={`${trait.type}-${trait.value}`}
                    className="border-jungle-100 bg-jungle-50/50 rounded-xl border p-3"
                  >
                    <div className="text-jungle-400 mb-1 text-xs tracking-wide uppercase">
                      {trait.type}
                    </div>
                    <div className="text-jungle-900 text-sm font-semibold">{trait.value}</div>
                    {trait.rarity && (
                      <span
                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${rarityColor(trait.rarity)}`}
                      >
                        {trait.rarity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner Actions */}
          <div className="border-jungle-100 space-y-3 rounded-2xl border bg-white p-6">
            <div className="text-jungle-900 mb-2 text-sm font-semibold">Owner Actions</div>
            <button
              className="bg-gator-500 hover:bg-gator-700 w-full rounded-xl px-5 py-3 text-sm font-medium text-white transition-colors"
              type="button"
              onClick={() => setIsAuctionDialogOpen(true)}
            >
              Put NFT in Auction
            </button>
            <button
              className="border-jungle-200 text-jungle-700 hover:bg-jungle-50 w-full rounded-xl border px-5 py-3 text-sm transition-colors"
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
          const result = await createAuction({
            nftId: nft.id,
            minimumBid: auctionMinBid,
            durationHours: Number.parseInt(auctionDuration, 10),
          });
          if (result.success) {
            setIsAuctionDialogOpen(false);
            if (result.auctionId) {
              router.push(`/auction/${result.auctionId}`);
              return;
            }
            router.push("/dashboard");
          }
        }}
      >
        <div className="mt-3 space-y-4">
          <div>
            <label htmlFor="auction-min-bid" className="text-jungle-600 mb-1 block text-sm">
              Minimum Bid (CRD)
            </label>
            <input
              id="auction-min-bid"
              type="number"
              min="1"
              value={auctionMinBid}
              onChange={(e) => setAuctionMinBid(e.target.value)}
              className="border-jungle-100 focus:ring-gator-300 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="auction-duration" className="text-jungle-600 mb-1 block text-sm">
              Duration (Hours)
            </label>
            <input
              id="auction-duration"
              type="number"
              min="1"
              value={auctionDuration}
              onChange={(e) => setAuctionDuration(e.target.value)}
              className="border-jungle-100 focus:ring-gator-300 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
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
        onCancel={() => {
          setIsTransferDialogOpen(false);
          setTransferToWallet("");
        }}
        onConfirm={async () => {
          const result = await transferNft({
            nftId: nft.id,
            toWallet: transferToWallet,
          });
          if (result.success) {
            setIsTransferDialogOpen(false);
            setTransferToWallet("");
            router.push("/nfts");
          }
        }}
      >
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="transfer-to-wallet" className="text-jungle-600 mb-1 block text-sm">
              Recipient Wallet Address
            </label>
            <input
              id="transfer-to-wallet"
              type="text"
              placeholder="0x..."
              value={transferToWallet}
              onChange={(e) => setTransferToWallet(e.target.value)}
              className="border-jungle-100 focus:ring-gator-300 w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          {transferNftError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {transferNftError}
            </div>
          )}
        </div>
      </ActionModal>
    </div>
  );
}
