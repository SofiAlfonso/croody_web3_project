"use client";

import { mockNFTs } from "@/lib/mock-data";

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";

export function useMyNfts(walletAddress?: string | null) {
  // TODO: Replace with real fetch by wallet address (contract read/indexer/API)
  // Example: /api/nfts?owner=<walletAddress>
  //
  // For now: demo address or no address → return all mocks.
  // A real wallet returns all mocks too until the API is wired.
  const data =
    !walletAddress || walletAddress === DEMO_ADDRESS
      ? mockNFTs
      : mockNFTs; // real wallets: replace with [] or real API call

  return {
    data,
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
