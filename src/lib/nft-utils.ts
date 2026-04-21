import type { NFT } from "@/lib/mock-data";
import { mockNFTs } from "@/lib/mock-data";

export function findMockByTokenId(id: string): NFT | undefined {
  return mockNFTs.find((nft) => nft.id === id || nft.id === id.padStart(3, "0"));
}

export function toGatewayURL(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
}
