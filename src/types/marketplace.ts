/**
 * Tipos relacionados con el marketplace
 */

export interface Listing {
  listingId: bigint;
  nftContract: `0x${string}`;
  tokenId: bigint;
  seller: `0x${string}`;
  price: bigint;
  isActive: boolean;
}

export interface ListingParams {
  nftContract: `0x${string}`;
  tokenId: bigint;
  price: bigint;
}
