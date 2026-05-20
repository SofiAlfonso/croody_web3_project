"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { parseAbiItem, formatUnits } from "viem";
import { ACTIVE_CHAIN } from "@/lib/chain";
import { getMarketplaceAddress } from "@/lib/contracts";

const BID_PLACED = parseAbiItem(
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
);

export type AuctionBid = {
  txHash: string | undefined;
  bidder: string;
  amount: string;
  timestamp: number;
  blockNumber: bigint | undefined;
};

const now = Math.floor(Date.now() / 1000);

const DEMO_BIDS: AuctionBid[] = [
  {
    txHash: "0xdemo0001",
    bidder: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: "150.0",
    timestamp: now - 900,
    blockNumber: BigInt(12),
  },
  {
    txHash: "0xdemo0002",
    bidder: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    amount: "120.0",
    timestamp: now - 3600,
    blockNumber: BigInt(9),
  },
  {
    txHash: "0xdemo0003",
    bidder: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: "100.0",
    timestamp: now - 7200,
    blockNumber: BigInt(5),
  },
];

export function useAuctionBids(auctionId: string, isDemo = false) {
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });
  const marketplaceAddress = getMarketplaceAddress();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auction-bids", auctionId],
    enabled:
      !isDemo &&
      Boolean(publicClient) &&
      Boolean(marketplaceAddress) &&
      Boolean(auctionId),
    staleTime: 15_000,
    queryFn: async (): Promise<AuctionBid[]> => {
      if (!publicClient || !marketplaceAddress) return [];

      const logs = await publicClient.getLogs({
        address: marketplaceAddress,
        event: BID_PLACED,
        args: { auctionId: BigInt(auctionId) },
        fromBlock: BigInt(0),
        toBlock: "latest",
      });

      if (logs.length === 0) return [];

      const uniqueBlocks = [
        ...new Set(
          logs.map((l) => l.blockNumber).filter(Boolean) as bigint[],
        ),
      ];
      const blockTimestamps = new Map<bigint, number>();
      await Promise.all(
        uniqueBlocks.map(async (blockNumber) => {
          const block = await publicClient.getBlock({ blockNumber });
          blockTimestamps.set(blockNumber, Number(block.timestamp));
        }),
      );

      return logs
        .map((l) => ({
          txHash: l.transactionHash ?? undefined,
          bidder: l.args.bidder ?? "",
          amount:
            l.args.amount !== undefined ? formatUnits(l.args.amount, 18) : "0",
          timestamp: l.blockNumber
            ? (blockTimestamps.get(l.blockNumber) ?? 0)
            : 0,
          blockNumber: l.blockNumber ?? undefined,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    },
  });

  if (isDemo) {
    return { bids: DEMO_BIDS, isLoading: false, error: null, refetch };
  }

  return {
    bids: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
