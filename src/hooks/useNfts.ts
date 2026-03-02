"use client";

import { mockNFTs } from "@/lib/mock-data";

export function useMyNfts(_walletAddress?: string | null) {
  // TODO: Replace with real fetch by wallet address (contract read/indexer/API)
  // Example: /api/nfts?owner=<walletAddress>
  return {
    data: mockNFTs,
    isLoading: false,
    error: null as string | null,
  };
}

export function useNftById(id?: string) {
  // TODO: Replace with real detail fetch by token id
  const nft = mockNFTs.find((item) => item.id === id);

  return {
    data: nft ?? null,
    isLoading: false,
    error: null as string | null,
  };
}
