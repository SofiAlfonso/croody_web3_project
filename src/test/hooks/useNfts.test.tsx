import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyNfts, useNftById } from "@/hooks/useNfts";

const { mockReadContract } = vi.hoisted(() => ({ mockReadContract: vi.fn() }));

vi.mock("viem", async () => {
  const actual = await vi.importActual<typeof import("viem")>("viem");
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ readContract: mockReadContract })),
    http: vi.fn(),
  };
});

vi.mock("viem/chains", async () => vi.importActual("viem/chains"));

vi.mock("@/lib/contracts", () => ({
  getNftCollectionAddress: () => "0x5FbDB2315678afecb367f032d93F642f64180aa3",
}));

vi.mock("@/lib/abis/nftCollection", () => ({
  nftCollectionAbi: [],
}));

vi.mock("@/lib/nft-utils", () => ({
  toGatewayURL: (uri: string) => uri,
  findMockByTokenId: () => undefined,
}));

vi.mock("@/lib/mock-data", () => ({
  mockNFTs: [],
}));

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";
const REAL_ADDRESS = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
const OWNER_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function mockFetch(data: object, ok = true) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  }));
}

describe("useMyNfts", () => {
  beforeEach(() => { mockReadContract.mockClear(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns empty array when wallet address is null", () => {
    const { result } = renderHook(() => useMyNfts(null), { wrapper });
    expect(result.current.data).to.deep.equal([]);
  });

  it("returns empty array when no NFTs on-chain", async () => {
    mockReadContract.mockResolvedValue(BigInt(0));
    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data).to.deep.equal([]);
  });

  it("returns on-chain NFTs with fallback name when fetch fails", async () => {
    mockReadContract
      .mockResolvedValueOnce(BigInt(1))
      .mockResolvedValueOnce(BigInt(5))
      .mockResolvedValueOnce("ipfs://test/metadata.json");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data.length).to.equal(1);
    expect(result.current.data[0].id).to.equal("5");
  });

  it("returns on-chain NFTs with metadata from fetch success", async () => {
    mockReadContract
      .mockResolvedValueOnce(BigInt(1))
      .mockResolvedValueOnce(BigInt(3))
      .mockResolvedValueOnce("ipfs://nft/3/metadata.json");
    mockFetch({
      name: "My On-Chain NFT",
      description: "desc",
      image: "https://example.com/img.png",
      attributes: [{ trait_type: "Color", value: "Blue" }],
    });

    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data[0].name).to.equal("My On-Chain NFT");
  });

  it("returns null from fetchMetadata when response is not ok", async () => {
    mockReadContract
      .mockResolvedValueOnce(BigInt(1))
      .mockResolvedValueOnce(BigInt(7))
      .mockResolvedValueOnce("ipfs://bad.json");
    mockFetch({}, false);

    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data[0].name).to.equal("Croody NFT #7");
  });

  it("demo mode does not call readContract", () => {
    const { result } = renderHook(() => useMyNfts(DEMO_ADDRESS), { wrapper });
    expect(mockReadContract).not.toHaveBeenCalled();
    expect(result.current.data).to.deep.equal([]);
  });
});

describe("useNftById", () => {
  beforeEach(() => { mockReadContract.mockClear(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns null when no id provided", async () => {
    const { result } = renderHook(() => useNftById(undefined), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data).to.equal(null);
  });

  it("returns null when mock not found and no chain data", async () => {
    mockReadContract
      .mockResolvedValueOnce("ipfs://meta.json")
      .mockResolvedValueOnce(OWNER_ADDRESS as `0x${string}`);
    mockFetch({ name: "Chain NFT", image: "https://img.png" });

    const { result } = renderHook(() => useNftById("99"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data?.id).to.equal("99");
    expect(result.current.data?.name).to.equal("Chain NFT");
    expect(result.current.data?.ownerAddress).to.equal(OWNER_ADDRESS);
  });

  it("falls back to null when readContract throws", async () => {
    mockReadContract.mockRejectedValue(new Error("token not found"));
    const { result } = renderHook(() => useNftById("999"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data).to.equal(null);
  });

  it("uses fallback name when metadata fetch fails", async () => {
    mockReadContract
      .mockResolvedValueOnce("ipfs://meta.json")
      .mockResolvedValueOnce(OWNER_ADDRESS as `0x${string}`);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const { result } = renderHook(() => useNftById("42"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data?.name).to.equal("Croody NFT #42");
  });
});
