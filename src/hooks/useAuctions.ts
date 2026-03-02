"use client";

import { useMemo } from "react";
import { mockAuctions } from "@/lib/mock-data";

export function useLiveAuctions() {
  // TODO: Replace with real live auctions query (API/indexer/contract)
  return {
    data: mockAuctions,
    isLoading: false,
    error: null as string | null,
  };
}

export function useMyAuctions(walletAddress?: string | null) {
  const normalizedWallet = walletAddress ?? "0xA3f...92B";

  const data = useMemo(() => {
    // TODO: Replace with real fetch for auctions owned/joined by wallet
    return mockAuctions.slice(0, 2).map((auction, index) => {
      const ownerAddress = index === 0 ? "0xA3f...92B" : "0xOwner...D2C";

      return {
        ...auction,
        ownerAddress,
        status: "Live" as const,
        isOwner: ownerAddress === normalizedWallet,
      };
    });
  }, [normalizedWallet]);

  return {
    data,
    isLoading: false,
    error: null as string | null,
  };
}

export function useAuctionById(id?: string) {
  // TODO: Replace with real detail fetch by auction id
  const auction = mockAuctions.find((item) => item.id === id);

  return {
    data: auction ?? null,
    isLoading: false,
    error: null as string | null,
  };
}
