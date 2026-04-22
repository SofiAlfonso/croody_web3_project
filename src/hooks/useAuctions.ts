"use client";

import { useMemo } from "react";
import { formatUnits, parseAbi } from "viem";
import { useReadContract } from "wagmi";
import { mockAuctions, type Auction } from "@/lib/mock-data";
import { getMarketplaceAddress } from "@/lib/contracts";
import { findMockByTokenId } from "@/lib/nft-utils";

const marketplaceAbi = parseAbi([
  "function getAllActiveAuctions() view returns ((uint256 auctionId,address seller,address nftContract,uint256 tokenId,uint256 startPrice,uint256 highestBid,address highestBidder,uint256 endTime,bool ended,bool cancelled)[])",
  "function getAuction(uint256 auctionId) view returns (address seller,address nftContract,uint256 tokenId,uint256 startPrice,uint256 highestBid,address highestBidder,uint256 endTime,bool ended,bool cancelled)",
]);

type ActiveAuctionRaw = {
  auctionId: bigint;
  seller: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  startPrice: bigint;
  highestBid: bigint;
  highestBidder: `0x${string}`;
  endTime: bigint;
  ended: boolean;
  cancelled: boolean;
};

type AuctionRaw = {
  seller: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  startPrice: bigint;
  highestBid: bigint;
  highestBidder: `0x${string}`;
  endTime: bigint;
  ended: boolean;
  cancelled: boolean;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

function pickBigInt(value: unknown, fallback = 0n): bigint {
  return typeof value === "bigint" ? value : fallback;
}

function pickAddress(value: unknown): `0x${string}` {
  if (typeof value === "string" && value.startsWith("0x") && value.length === 42) {
    return value as `0x${string}`;
  }
  return ZERO_ADDRESS;
}

function pickBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function decodeActiveAuction(raw: ActiveAuctionRaw | readonly unknown[] | unknown): ActiveAuctionRaw {
  const tuple = Array.isArray(raw) ? raw : null;
  const obj =
    !Array.isArray(raw) && typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : null;

  return {
    auctionId: pickBigInt(tuple ? tuple[0] : obj?.auctionId),
    seller: pickAddress(tuple ? tuple[1] : obj?.seller),
    nftContract: pickAddress(tuple ? tuple[2] : obj?.nftContract),
    tokenId: pickBigInt(tuple ? tuple[3] : obj?.tokenId),
    startPrice: pickBigInt(tuple ? tuple[4] : obj?.startPrice),
    highestBid: pickBigInt(tuple ? tuple[5] : obj?.highestBid),
    highestBidder: pickAddress(tuple ? tuple[6] : obj?.highestBidder),
    endTime: pickBigInt(tuple ? tuple[7] : obj?.endTime),
    ended: pickBoolean(tuple ? tuple[8] : obj?.ended),
    cancelled: pickBoolean(tuple ? tuple[9] : obj?.cancelled),
  };
}

function decodeAuctionById(raw: AuctionRaw | readonly unknown[] | unknown, auctionId: number): ActiveAuctionRaw {
  const tuple = Array.isArray(raw) ? raw : null;
  const obj =
    !Array.isArray(raw) && typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : null;

  return {
    auctionId: BigInt(auctionId),
    seller: pickAddress(tuple ? tuple[0] : obj?.seller),
    nftContract: pickAddress(tuple ? tuple[1] : obj?.nftContract),
    tokenId: pickBigInt(tuple ? tuple[2] : obj?.tokenId),
    startPrice: pickBigInt(tuple ? tuple[3] : obj?.startPrice),
    highestBid: pickBigInt(tuple ? tuple[4] : obj?.highestBid),
    highestBidder: pickAddress(tuple ? tuple[5] : obj?.highestBidder),
    endTime: pickBigInt(tuple ? tuple[6] : obj?.endTime),
    ended: pickBoolean(tuple ? tuple[7] : obj?.ended),
    cancelled: pickBoolean(tuple ? tuple[8] : obj?.cancelled),
  };
}

function formatTimeLeft(endTimeSeconds: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTimeSeconds);
  const remaining = end - now;

  if (remaining <= 0) return "0m";

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function toUiAuction(rawInput: ActiveAuctionRaw | readonly unknown[] | unknown): Auction {
  const raw = decodeActiveAuction(rawInput);
  const tokenId = Number(raw.tokenId);
  const currentBidRaw = raw.highestBid > 0n ? raw.highestBid : raw.startPrice;
  const mockItem = findMockByTokenId(tokenId.toString());

  return {
    id: raw.auctionId.toString(),
    name: mockItem?.name || `Croody NFT #${tokenId}`,
    image: mockItem?.image || `https://picsum.photos/seed/auction-${tokenId}/600/600`,
    currentBid: Number(formatUnits(currentBidRaw, 18)),
    startPrice: Number(formatUnits(raw.startPrice, 18)),
    timeLeft: formatTimeLeft(raw.endTime),
    endTime: Number(raw.endTime),
    ownerAddress: raw.seller,
    highestBidder: raw.highestBidder !== ZERO_ADDRESS ? raw.highestBidder : null,
    status: raw.ended ? "Ended" : "Live",
  };
}

export function useLiveAuctions() {
  const marketplaceAddress = getMarketplaceAddress();
  const { data, isLoading, isError } = useReadContract({
    address: marketplaceAddress ?? undefined,
    abi: marketplaceAbi,
    functionName: "getAllActiveAuctions",
    query: {
      enabled: Boolean(marketplaceAddress),
    },
  });

  const chainAuctions = useMemo(() => {
    if (!data) return [] as Auction[];
    if (!Array.isArray(data)) return [] as Auction[];
    return data.map((item) => toUiAuction(item));
  }, [data]);

  return {
    data: marketplaceAddress ? chainAuctions : mockAuctions,
    isLoading,
    error: isError ? "Failed to fetch live auctions" : (null as string | null),
  };
}

export function useMyAuctions(walletAddress?: string | null) {
  const { data: liveAuctions, isLoading, error } = useLiveAuctions();
  const normalizedWallet = walletAddress?.toLowerCase();

  const data = useMemo(() => {
    if (!normalizedWallet) return [] as Auction[];
    return liveAuctions.filter((auction) => auction.ownerAddress.toLowerCase() === normalizedWallet);
  }, [liveAuctions, normalizedWallet]);

  return {
    data,
    isLoading,
    error,
  };
}

export function useAuctionById(id?: string) {
  const marketplaceAddress = getMarketplaceAddress();
  const parsedId = id ? Number.parseInt(id, 10) : NaN;
  const isValidId = Number.isInteger(parsedId) && parsedId > 0;

  const { data, isLoading, isError } = useReadContract({
    address: marketplaceAddress ?? undefined,
    abi: marketplaceAbi,
    functionName: "getAuction",
    args: [BigInt(isValidId ? parsedId : 0)],
    query: {
      enabled: Boolean(marketplaceAddress) && isValidId,
    },
  });

  const auction = useMemo(() => {
    if (!marketplaceAddress) {
      return mockAuctions.find((item) => item.id === id) ?? null;
    }

    if (!data || !isValidId) return null;

    const raw = decodeAuctionById(data as AuctionRaw | readonly unknown[] | unknown, parsedId);
    if (raw.seller === ZERO_ADDRESS) {
      return null;
    }

    return toUiAuction(raw);
  }, [data, id, isValidId, marketplaceAddress, parsedId]);

  return {
    data: auction,
    isLoading,
    error: isError ? "Failed to fetch auction" : (null as string | null),
  };
}
