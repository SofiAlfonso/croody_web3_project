"use client";

import { useState } from "react";

type CreateAuctionParams = {
  nftId: string;
  minimumBid: string;
  durationHours: number;
};

export function useCreateAuction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAuction = async (_params: CreateAuctionParams) => {
    setIsPending(true);
    setError(null);

    try {
      // TODO: Implement real create auction flow.
      // - Check NFT ownership and approval for marketplace contract
      // - Build and sign create auction transaction
      // - Submit transaction and wait for confirmation
      await Promise.resolve();
      return { success: true as const };
    } catch {
      setError("Failed to create auction");
      return { success: false as const };
    } finally {
      setIsPending(false);
    }
  };

  return { createAuction, isPending, error };
}
