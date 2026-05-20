export type TransactionType =
  | "token_sent"
  | "token_received"
  | "nft_sent"
  | "nft_received"
  | "bid_placed"
  | "auction_created";

export type TransactionStatus = "pending" | "confirmed";

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  txHash: `0x${string}` | undefined;
  blockNumber: bigint | undefined;
  timestamp: number;
  from: string;
  to: string;
  amount?: string;
  tokenId?: string;
  auctionId?: string;
  status: TransactionStatus;
}
