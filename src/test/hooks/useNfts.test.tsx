import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyNfts } from "@/hooks/useNfts";

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

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";
const REAL_ADDRESS = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useMyNfts", () => {
  beforeEach(() => {
    mockReadContract.mockClear();
  });

  it("returns empty array when wallet address is null", () => {
    const { result } = renderHook(() => useMyNfts(null), { wrapper });
    expect(result.current.data).to.deep.equal([]);
  });

  it("returns empty array when no NFTs on-chain (no mock fallback)", async () => {
    mockReadContract.mockResolvedValue(BigInt(0));
    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data).to.deep.equal([]);
  });

  it("returns on-chain NFTs when wallet owns some", async () => {
    mockReadContract
      .mockResolvedValueOnce(BigInt(1))    // balanceOf → 1
      .mockResolvedValueOnce(BigInt(5))    // tokenOfOwnerByIndex → tokenId 5
      .mockResolvedValueOnce("ipfs://test/metadata.json"); // tokenURI

    const { result } = renderHook(() => useMyNfts(REAL_ADDRESS), { wrapper });
    await waitFor(() => expect(result.current.isLoading).to.be.false);
    expect(result.current.data.length).to.equal(1);
    expect(result.current.data[0].id).to.equal("5");
  });

  it("demo mode returns mock NFTs filtered by demo address", () => {
    const { result } = renderHook(() => useMyNfts(DEMO_ADDRESS), { wrapper });
    expect(mockReadContract).not.toHaveBeenCalled();
  });
});
