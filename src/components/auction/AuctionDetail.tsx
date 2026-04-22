"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, User, Tag } from "lucide-react";
import { useWalletContext } from "@/context/WalletContext";
import { useAuctionById } from "@/hooks/useAuctions";
import { useEndAuction } from "@/hooks/useEndAuction";
import { useCancelAuction } from "@/hooks/useCancelAuction";
import { usePlaceBid } from "@/hooks/usePlaceBid";
import AppHeader from "@/components/shared/AppHeader";
import WalletBadge from "@/components/shared/WalletBadge";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";
import NotFoundState from "@/components/shared/NotFoundState";
import ActionModal from "@/components/shared/ActionModal";

interface AuctionDetailProps {
  id: string;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function AuctionDetail({ id }: AuctionDetailProps) {
  const router = useRouter();
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const { walletAddress } = useWalletContext();
  const { data: auction } = useAuctionById(id);
  const { placeBid, isPending: isPlacingBid } = usePlaceBid();
  const { endAuction, isPending: isEndingAuction } = useEndAuction();
  const { cancelAuction, isPending: isCancelling } = useCancelAuction();

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

  const now = Math.floor(Date.now() / 1000);
  const isExpired = auction.endTime > 0 && now >= auction.endTime;
  const isOwner =
    Boolean(walletAddress) && walletAddress?.toLowerCase() === auction.ownerAddress.toLowerCase();
  const canEndAuction = isExpired && !auction.status.includes("Ended");
  const minBid = auction.currentBid > 0 ? auction.currentBid + 1 : auction.startPrice;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="Auction" sticky rightClassName="flex items-center gap-3">
        <BackToDashboardLink />
        <WalletBadge />
      </AppHeader>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* NFT Image */}
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

        {/* Auction Info */}
        <div className="space-y-4">
          {/* Bid & Timer */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-neutral-500">Current Bid</div>
                <div className="text-3xl font-semibold text-neutral-900">
                  {auction.currentBid} CRD
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  isExpired
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {isExpired ? "Expired" : `${auction.timeLeft} left`}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {canEndAuction ? (
                <button
                  className="bg-gator-500 hover:bg-gator-700 w-full rounded-lg px-5 py-3 text-center text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isEndingAuction}
                  onClick={async () => {
                    const result = await endAuction({ auctionId: auction.id });
                    if (result.success) {
                      router.push("/dashboard");
                    }
                  }}
                >
                  {isEndingAuction ? "Closing Auction..." : "Close Auction"}
                </button>
              ) : isOwner ? (
                <>
                  <div className="rounded-lg bg-neutral-100 px-5 py-3 text-center text-sm text-neutral-500">
                    You are the seller — wait for the auction to expire to close it
                  </div>
                  {!auction.highestBidder && (
                    <button
                      className="w-full rounded-lg border border-red-200 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      disabled={isCancelling}
                      onClick={async () => {
                        const result = await cancelAuction({ auctionId: auction.id });
                        if (result.success) {
                          router.push("/dashboard");
                        }
                      }}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Auction"}
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="bg-gator-100 text-gator-700 hover:bg-gator-300 w-full rounded-lg px-5 py-3 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isExpired}
                  onClick={() => {
                    setBidAmount(String(minBid));
                    setIsBidDialogOpen(true);
                  }}
                >
                  Place Bid
                </button>
              )}
            </div>
          </div>

          {/* Auction Details */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
            <div className="text-sm font-semibold text-neutral-700">Auction Details</div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Tag className="h-4 w-4" />
                Start Price
              </div>
              <span className="font-medium text-neutral-900">{auction.startPrice} CRD</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <User className="h-4 w-4" />
                Seller
              </div>
              <span className="font-mono text-neutral-900">
                {truncateAddress(auction.ownerAddress)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <User className="h-4 w-4" />
                Highest Bidder
              </div>
              <span className="font-mono text-neutral-900">
                {auction.highestBidder ? truncateAddress(auction.highestBidder) : "No bids yet"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Clock className="h-4 w-4" />
                Ends At
              </div>
              <span className="text-neutral-900">
                {auction.endTime
                  ? new Date(auction.endTime * 1000).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isExpired
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isExpired ? "Expired" : "Live"}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Place Bid Modal */}
      {!isOwner && (
        <ActionModal
          isOpen={isBidDialogOpen}
          title="Place a Bid"
          description={`Minimum bid: ${minBid} CRD`}
          cancelLabel="Cancel"
          confirmLabel="Submit Bid"
          isConfirming={isPlacingBid}
          onCancel={() => setIsBidDialogOpen(false)}
          onConfirm={async () => {
            const result = await placeBid({
              auctionId: auction.id,
              amount: bidAmount,
            });
            if (result.success) {
              setIsBidDialogOpen(false);
            }
          }}
        >
          <div className="mt-4">
            <label className="block text-sm text-neutral-600 mb-1" htmlFor="bid-amount">
              Bid Amount (CRD)
            </label>
            <input
              id="bid-amount"
              type="number"
              min={minBid}
              step="1"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder={`Min ${minBid} CRD`}
            />
          </div>
        </ActionModal>
      )}
    </div>
  );
}
