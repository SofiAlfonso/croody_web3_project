"use client";

import { useState } from "react";
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

      <main className="max-w-6xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="aspect-square bg-neutral-100">
            <img src={auction.image} alt={auction.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-semibold text-neutral-900">{auction.name}</div>
            <div className="text-sm text-neutral-500 mt-2">Auction ID: {auction.id}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">Current Bid</div>
                <div className="text-3xl font-semibold text-neutral-900">{auction.currentBid} CRD</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="w-4 h-4" />
                {auction.timeLeft} left
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                className="w-full px-5 py-3 rounded-lg bg-gator-100 text-gator-700 text-sm hover:bg-gator-300 transition-colors text-center"
                type="button"
                onClick={() => setIsBidDialogOpen(true)}
              >
                Place Bid
              </button>
              <button
                className="w-full px-5 py-3 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50"
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