"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useAuctionById } from "@/hooks/useAuctions";
import { usePlaceBid } from "@/hooks/usePlaceBid";
import AppHeader from "@/components/shared/AppHeader";
import WalletBadge from "@/components/shared/WalletBadge";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";
import NotFoundState from "@/components/shared/NotFoundState";
import ActionModal from "@/components/shared/ActionModal";

interface AuctionDetailProps {
  id: string;
}

export default function AuctionDetail({ id }: AuctionDetailProps) {
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const { data: auction } = useAuctionById(id);
  const { placeBid, isPending: isPlacingBid } = usePlaceBid();

  if (!auction) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="Auction" sticky>
          <BackToDashboardLink />
        </AppHeader>
        <NotFoundState
          title="Auction not found"
          description="Choose an auction from the dashboard."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader
        title="Auction"
        sticky
        rightClassName="flex items-center gap-3"
      >
        <BackToDashboardLink />
        <WalletBadge />
      </AppHeader>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="relative aspect-square bg-neutral-100">
            <Image
              src={auction.image}
              alt={auction.name}
              className="h-full w-full object-cover"
              fill
            />
          </div>
          <div className="p-6">
            <div className="text-2xl font-semibold text-neutral-900">{auction.name}</div>
            <div className="mt-2 text-sm text-neutral-500">Auction ID: {auction.id}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">Current Bid</div>
                <div className="text-3xl font-semibold text-neutral-900">
                  {auction.currentBid} CRD
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="h-4 w-4" />
                {auction.timeLeft} left
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                className="bg-gator-100 text-gator-700 hover:bg-gator-300 w-full rounded-lg px-5 py-3 text-center text-sm transition-colors"
                type="button"
                onClick={() => setIsBidDialogOpen(true)}
              >
                Place Bid
              </button>
              <button
                className="w-full rounded-lg border border-neutral-200 px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
                type="button"
              >
                {/* TODO: Implement auto-bid strategy */}
                Set Auto-Bid
              </button>
            </div>
          </div>
        </div>
      </main>

      <ActionModal
        isOpen={isBidDialogOpen}
        title="Place a Bid"
        description="Enter your bid amount in CRD."
        cancelLabel="Cancel"
        confirmLabel="Submit Bid"
        isConfirming={isPlacingBid}
        onCancel={() => setIsBidDialogOpen(false)}
        onConfirm={async () => {
          // TODO: Wire bid amount input from dialog form state.
          await placeBid({
            auctionId: auction.id,
            amount: String(auction.currentBid + 10),
          });
          setIsBidDialogOpen(false);
        }}
      />
    </div>
  );
}
