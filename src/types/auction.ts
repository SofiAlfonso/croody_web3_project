/**
 * Tipos relacionados con subastas
 */

export interface Auction {
  auctionId: bigint;
  nftContract: `0x${string}`;
  tokenId: bigint;
  seller: `0x${string}`;
  startPrice: bigint;
  highestBid: bigint;
  highestBidder: `0x${string}`;
  endTime: bigint;
  isActive: boolean;
}

export interface Bid {
  bidder: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}

export interface CreateAuctionParams {
  nftContract: `0x${string}`;
  tokenId: bigint;
  startPrice: bigint;
  duration: bigint; // en segundos
}
