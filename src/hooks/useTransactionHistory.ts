"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import { hardhat } from "wagmi/chains";
import { useWalletContext } from "@/context/WalletContext";
import {
  getNftCollectionAddress,
  getMarketplaceAddress,
  getProjectTokenAddress,
} from "@/lib/contracts";
import type { TransactionRecord } from "@/lib/transaction-types";
import { getPendingTxsForWallet, removePendingTxByHash } from "@/lib/transaction-store";

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";
const SAMPLE_ADDR_A = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const SAMPLE_ADDR_B = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const now = Math.floor(Date.now() / 1000);

const DEMO_HISTORY: TransactionRecord[] = [
  {
    id: "demo-6",
    type: "token_received",
    txHash: undefined,
    blockNumber: undefined,
    timestamp: now - 300,
    from: SAMPLE_ADDR_A,
    to: DEMO_ADDRESS,
    amount: "200.0",
    status: "pending",
  },
  {
    id: "demo-1",
    type: "token_sent",
    txHash: "0xabc1000000000000000000000000000000000000000000000000000000000001",
    blockNumber: BigInt(42),
    timestamp: now - 7200,
    from: DEMO_ADDRESS,
    to: SAMPLE_ADDR_A,
    amount: "50.0",
    status: "confirmed",
  },
  {
    id: "demo-2",
    type: "token_received",
    txHash: "0xabc2000000000000000000000000000000000000000000000000000000000002",
    blockNumber: BigInt(39),
    timestamp: now - 14400,
    from: SAMPLE_ADDR_B,
    to: DEMO_ADDRESS,
    amount: "120.0",
    status: "confirmed",
  },
  {
    id: "demo-3",
    type: "bid_placed",
    txHash: "0xabc3000000000000000000000000000000000000000000000000000000000003",
    blockNumber: BigInt(35),
    timestamp: now - 28800,
    from: DEMO_ADDRESS,
    to: SAMPLE_ADDR_A,
    amount: "75.0",
    auctionId: "2",
    status: "confirmed",
  },
  {
    id: "demo-4",
    type: "nft_sent",
    txHash: "0xabc4000000000000000000000000000000000000000000000000000000000004",
    blockNumber: BigInt(28),
    timestamp: now - 86400,
    from: DEMO_ADDRESS,
    to: SAMPLE_ADDR_B,
    tokenId: "5",
    status: "confirmed",
  },
  {
    id: "demo-5",
    type: "auction_created",
    txHash: "0xabc5000000000000000000000000000000000000000000000000000000000005",
    blockNumber: BigInt(20),
    timestamp: now - 172800,
    from: DEMO_ADDRESS,
    to: SAMPLE_ADDR_A,
    amount: "10.0",
    tokenId: "3",
    auctionId: "1",
    status: "confirmed",
  },
];

type PublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

const ERC20_TRANSFER = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);
const ERC721_TRANSFER = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
);
const BID_PLACED = parseAbiItem(
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
);
const AUCTION_CREATED = parseAbiItem(
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, address nftContract, uint256 tokenId, uint256 startPrice, uint256 endTime)",
);

async function fetchOnChainHistory(
  walletAddress: string,
  publicClient: PublicClient,
): Promise<TransactionRecord[]> {
  const tokenAddress = getProjectTokenAddress();
  const nftAddress = getNftCollectionAddress();
  const marketplaceAddress = getMarketplaceAddress();
  const userAddr = walletAddress as `0x${string}`;

  const queries: Promise<TransactionRecord[]>[] = [];

  if (tokenAddress) {
    queries.push(
      publicClient
        .getLogs({
          address: tokenAddress,
          event: ERC20_TRANSFER,
          args: { from: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs
            .filter(
              (l) =>
                l.args.to?.toLowerCase() !== marketplaceAddress?.toLowerCase(),
            )
            .map((l) => ({
              id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-token-sent`,
              type: "token_sent" as const,
              txHash: l.transactionHash ?? undefined,
              blockNumber: l.blockNumber ?? undefined,
              timestamp: 0,
              from: l.args.from ?? "",
              to: l.args.to ?? "",
              amount:
                l.args.value !== undefined
                  ? formatUnits(l.args.value, 18)
                  : undefined,
              status: "confirmed" as const,
            })),
        ),
    );

    queries.push(
      publicClient
        .getLogs({
          address: tokenAddress,
          event: ERC20_TRANSFER,
          args: { to: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs
            .filter(
              (l) =>
                l.args.from?.toLowerCase() !== marketplaceAddress?.toLowerCase(),
            )
            .map((l) => ({
              id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-token-received`,
              type: "token_received" as const,
              txHash: l.transactionHash ?? undefined,
              blockNumber: l.blockNumber ?? undefined,
              timestamp: 0,
              from: l.args.from ?? "",
              to: l.args.to ?? "",
              amount:
                l.args.value !== undefined
                  ? formatUnits(l.args.value, 18)
                  : undefined,
              status: "confirmed" as const,
            })),
        ),
    );
  }

  if (nftAddress) {
    queries.push(
      publicClient
        .getLogs({
          address: nftAddress,
          event: ERC721_TRANSFER,
          args: { from: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs
            .filter(
              (l) =>
                l.args.to?.toLowerCase() !== marketplaceAddress?.toLowerCase(),
            )
            .map((l) => ({
              id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-nft-sent`,
              type: "nft_sent" as const,
              txHash: l.transactionHash ?? undefined,
              blockNumber: l.blockNumber ?? undefined,
              timestamp: 0,
              from: l.args.from ?? "",
              to: l.args.to ?? "",
              tokenId:
                l.args.tokenId !== undefined
                  ? l.args.tokenId.toString()
                  : undefined,
              status: "confirmed" as const,
            })),
        ),
    );

    queries.push(
      publicClient
        .getLogs({
          address: nftAddress,
          event: ERC721_TRANSFER,
          args: { to: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs
            .filter(
              (l) =>
                l.args.from?.toLowerCase() !== marketplaceAddress?.toLowerCase(),
            )
            .map((l) => ({
              id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-nft-received`,
              type: "nft_received" as const,
              txHash: l.transactionHash ?? undefined,
              blockNumber: l.blockNumber ?? undefined,
              timestamp: 0,
              from: l.args.from ?? "",
              to: l.args.to ?? "",
              tokenId:
                l.args.tokenId !== undefined
                  ? l.args.tokenId.toString()
                  : undefined,
              status: "confirmed" as const,
            })),
        ),
    );
  }

  if (marketplaceAddress) {
    queries.push(
      publicClient
        .getLogs({
          address: marketplaceAddress,
          event: BID_PLACED,
          args: { bidder: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs.map((l) => ({
            id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-bid`,
            type: "bid_placed" as const,
            txHash: l.transactionHash ?? undefined,
            blockNumber: l.blockNumber ?? undefined,
            timestamp: 0,
            from: userAddr,
            to: marketplaceAddress,
            amount:
              l.args.amount !== undefined
                ? formatUnits(l.args.amount, 18)
                : undefined,
            auctionId:
              l.args.auctionId !== undefined
                ? l.args.auctionId.toString()
                : undefined,
            status: "confirmed" as const,
          })),
        ),
    );

    queries.push(
      publicClient
        .getLogs({
          address: marketplaceAddress,
          event: AUCTION_CREATED,
          args: { seller: userAddr },
          fromBlock: BigInt(0),
          toBlock: "latest",
        })
        .then((logs) =>
          logs.map((l) => ({
            id: `${l.transactionHash ?? "unknown"}-${l.logIndex}-auction`,
            type: "auction_created" as const,
            txHash: l.transactionHash ?? undefined,
            blockNumber: l.blockNumber ?? undefined,
            timestamp: 0,
            from: userAddr,
            to: marketplaceAddress,
            amount:
              l.args.startPrice !== undefined
                ? formatUnits(l.args.startPrice, 18)
                : undefined,
            tokenId:
              l.args.tokenId !== undefined
                ? l.args.tokenId.toString()
                : undefined,
            auctionId:
              l.args.auctionId !== undefined
                ? l.args.auctionId.toString()
                : undefined,
            status: "confirmed" as const,
          })),
        ),
    );
  }

  const results = await Promise.all(queries);
  const allRecords = results.flat();

  const uniqueBlocks = [
    ...new Set(
      allRecords.map((r) => r.blockNumber).filter(Boolean) as bigint[],
    ),
  ];

  const blockTimestamps = new Map<bigint, number>();
  await Promise.all(
    uniqueBlocks.map(async (blockNumber) => {
      const block = await publicClient.getBlock({ blockNumber });
      blockTimestamps.set(blockNumber, Number(block.timestamp));
    }),
  );

  return allRecords
    .map((r) => ({
      ...r,
      timestamp: r.blockNumber
        ? (blockTimestamps.get(r.blockNumber) ?? 0)
        : 0,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function useTransactionHistory() {
  const { walletAddress, isDemo } = useWalletContext();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transaction-history", walletAddress],
    enabled: Boolean(walletAddress) && !isDemo && Boolean(publicClient),
    staleTime: 30_000,
    queryFn: async (): Promise<TransactionRecord[]> => {
      if (!walletAddress || !publicClient) return [];

      const confirmed = await fetchOnChainHistory(walletAddress, publicClient);
      const confirmedHashes = new Set(
        confirmed.map((r) => r.txHash).filter(Boolean),
      );

      const pending = getPendingTxsForWallet(walletAddress);
      for (const p of pending) {
        if (p.hash && confirmedHashes.has(p.hash)) {
          removePendingTxByHash(p.hash);
        }
      }

      const stillPending = pending
        .filter((p) => !p.hash || !confirmedHashes.has(p.hash))
        .map(
          (p): TransactionRecord => ({
            id: p.id,
            type: p.type,
            txHash: p.hash,
            blockNumber: undefined,
            timestamp: p.timestamp,
            from: p.from,
            to: p.to,
            amount: p.amount,
            tokenId: p.tokenId,
            auctionId: p.auctionId,
            status: "pending",
          }),
        );

      return [...stillPending, ...confirmed].sort(
        (a, b) => b.timestamp - a.timestamp,
      );
    },
  });

  if (isDemo) {
    return { data: DEMO_HISTORY, isLoading: false, error: null, refetch };
  }

  return {
    data: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
