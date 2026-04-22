"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import type { NFT } from "@/lib/mock-data";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"),
});
import { mockNFTs } from "@/lib/mock-data";
import { getNftCollectionAddress } from "@/lib/contracts";
import { nftCollectionAbi } from "@/lib/abis/nftCollection";
import { findMockByTokenId, toGatewayURL } from "@/lib/nft-utils";

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";

async function fetchMetadata(uri: string): Promise<Partial<NFT> | null> {
  try {
    const res = await fetch(toGatewayURL(uri));
    if (!res.ok) return null;

    const metadata = (await res.json()) as {
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{ trait_type?: string; value?: string }>;
    };

    return {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image ? toGatewayURL(metadata.image) : undefined,
      traits: metadata.attributes
        ?.filter((a) => a.trait_type && a.value)
        .map((a) => ({
          type: String(a.trait_type),
          value: String(a.value),
        })),
    };
  } catch {
    return null;
  }
}

async function readOwnedNftsFromChain(owner: `0x${string}`): Promise<NFT[]> {
  const nftAddress = getNftCollectionAddress();
  if (!nftAddress) {
    return [];
  }

  const balance = (await publicClient.readContract({
    address: nftAddress,
    abi: nftCollectionAbi,
    functionName: "balanceOf",
    args: [owner],
  })) as bigint;

  if (balance === BigInt(0)) {
    return [];
  }

  const owned: NFT[] = [];

  for (let i = BigInt(0); i < balance; i += BigInt(1)) {
    const tokenId = (await publicClient.readContract({
      address: nftAddress,
      abi: nftCollectionAbi,
      functionName: "tokenOfOwnerByIndex",
      args: [owner, i],
    })) as bigint;

    const tokenIdString = tokenId.toString();
    const tokenURI = (await publicClient.readContract({
      address: nftAddress,
      abi: nftCollectionAbi,
      functionName: "tokenURI",
      args: [tokenId],
    })) as string;

    const fromMock = findMockByTokenId(tokenIdString);
    const metadata = await fetchMetadata(tokenURI);

    owned.push({
      id: tokenIdString,
      ownerAddress: owner,
      name: metadata?.name || fromMock?.name || `Croody NFT #${tokenIdString}`,
      image:
        metadata?.image || fromMock?.image || "https://picsum.photos/seed/croody-default/600/600",
      collection: fromMock?.collection || "Croody Collection",
      description: metadata?.description || fromMock?.description,
      traits: metadata?.traits || fromMock?.traits,
      floorPrice: fromMock?.floorPrice,
    });
  }

  return owned;
}

export function useMyNfts(walletAddress?: string | null) {
  const normalizedAddress = useMemo(() => {
    if (!walletAddress || !walletAddress.startsWith("0x")) return null;
    return walletAddress as `0x${string}`;
  }, [walletAddress]);

  const query = useQuery({
    queryKey: ["my-nfts", normalizedAddress],
    enabled: Boolean(normalizedAddress),
    queryFn: async () => {
      if (!normalizedAddress) return [] as NFT[];

      // Keep demo mode deterministic for screenshots/tests.
      if (normalizedAddress === DEMO_ADDRESS) {
        return mockNFTs.filter(
          (nft) => nft.ownerAddress?.toLowerCase() === DEMO_ADDRESS.toLowerCase(),
        );
      }

      return await readOwnedNftsFromChain(normalizedAddress);
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? "Failed to load NFTs" : null,
  };
}

export function useNftById(id?: string) {
  const query = useQuery({
    queryKey: ["nft-by-id", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;

      const fromMock = findMockByTokenId(id);
      const nftAddress = getNftCollectionAddress();

      if (!nftAddress) {
        return fromMock ?? null;
      }

      try {
        const tokenId = BigInt(id);

        const [tokenURI, ownerAddress] = await Promise.all([
          publicClient.readContract({
            address: nftAddress,
            abi: nftCollectionAbi,
            functionName: "tokenURI",
            args: [tokenId],
          }) as Promise<string>,
          publicClient.readContract({
            address: nftAddress,
            abi: nftCollectionAbi,
            functionName: "ownerOf",
            args: [tokenId],
          }) as Promise<`0x${string}`>,
        ]);

        const metadata = await fetchMetadata(tokenURI);

        return {
          id: tokenId.toString(),
          ownerAddress,
          name: metadata?.name || fromMock?.name || `Croody NFT #${tokenId.toString()}`,
          image:
            metadata?.image ||
            fromMock?.image ||
            "https://picsum.photos/seed/croody-default/600/600",
          collection: fromMock?.collection || "Croody Collection",
          description: metadata?.description || fromMock?.description,
          traits: metadata?.traits || fromMock?.traits,
          floorPrice: fromMock?.floorPrice,
        } as NFT;
      } catch {
        return fromMock ?? null;
      }
    },
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? "Failed to load NFT" : null,
  };
}
