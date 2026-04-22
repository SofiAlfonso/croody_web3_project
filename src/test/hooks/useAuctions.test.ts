import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReadContract } from "wagmi";
import { useLiveAuctions, useMyAuctions, useAuctionById } from "@/hooks/useAuctions";

let mockMarketplaceAddress: string | null = null;

vi.mock("wagmi", () => ({
  useReadContract: vi.fn(),
}));

vi.mock("@/lib/contracts", () => ({
  getMarketplaceAddress: () => mockMarketplaceAddress,
}));

vi.mock("@/lib/nft-utils", () => ({
  findMockByTokenId: () => undefined,
}));

vi.mock("@/lib/mock-data", () => ({
  mockAuctions: [
    {
      id: "1",
      name: "Mock Auction",
      image: "/mock.png",
      currentBid: 100,
      startPrice: 50,
      timeLeft: "2h",
      endTime: 9999999999,
      ownerAddress: "0xseller",
      highestBidder: null,
      status: "Live",
    },
  ],
}));

const FUTURE_END = BigInt(Math.floor(Date.now() / 1000) + 7200);
const MARKETPLACE = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const mockRawAuction = {
  auctionId: BigInt(1),
  seller: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
  nftContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`,
  tokenId: BigInt(5),
  startPrice: BigInt(100) * BigInt(10) ** BigInt(18),
  highestBid: BigInt(150) * BigInt(10) ** BigInt(18),
  highestBidder: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as `0x${string}`,
  endTime: FUTURE_END,
  ended: false,
  cancelled: false,
};

beforeEach(() => {
  mockMarketplaceAddress = null;
  vi.mocked(useReadContract).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useReadContract>);
});

describe("useLiveAuctions", () => {
  it("returns mock auctions when marketplace address is not configured", () => {
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data.length).to.equal(1);
    expect(result.current.data[0].name).to.equal("Mock Auction");
  });

  it("returns empty array when marketplace configured but no chain data", () => {
    mockMarketplaceAddress = MARKETPLACE;
    vi.mocked(useReadContract).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data).to.deep.equal([]);
  });

  it("transforms chain auction data to UI format", () => {
    mockMarketplaceAddress = MARKETPLACE;
    vi.mocked(useReadContract).mockReturnValue({
      data: [mockRawAuction],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data.length).to.equal(1);
    const auction = result.current.data[0];
    expect(auction.id).to.equal("1");
    expect(auction.currentBid).to.equal(150);
    expect(auction.status).to.equal("Live");
    expect(auction.highestBidder).to.equal("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  });

  it("sets highestBidder to null when zero address", () => {
    mockMarketplaceAddress = MARKETPLACE;
    const noHighestBidder = {
      ...mockRawAuction,
      highestBid: BigInt(0),
      highestBidder: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    };
    vi.mocked(useReadContract).mockReturnValue({
      data: [noHighestBidder],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data[0].highestBidder).to.equal(null);
    expect(result.current.data[0].currentBid).to.equal(100); // falls back to startPrice
  });

  it("sets status to Ended when auction.ended is true", () => {
    mockMarketplaceAddress = MARKETPLACE;
    vi.mocked(useReadContract).mockReturnValue({
      data: [{ ...mockRawAuction, ended: true }],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data[0].status).to.equal("Ended");
  });

  it("returns error string when isError is true", () => {
    mockMarketplaceAddress = MARKETPLACE;
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.error).to.equal("Failed to fetch live auctions");
  });

  it("passes enabled false when no marketplace address", () => {
    renderHook(() => useLiveAuctions());
    const call = vi.mocked(useReadContract).mock.lastCall?.[0] as { query?: { enabled?: boolean } };
    expect(call?.query?.enabled).to.be.false;
  });

  it("transforms tuple (array) format chain data", () => {
    mockMarketplaceAddress = MARKETPLACE;
    const tupleAuction = [
      BigInt(2),
      "0xabcdef1234567890abcdef1234567890abcdef12",
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      BigInt(3),
      BigInt(50) * BigInt(10) ** BigInt(18),
      BigInt(0),
      "0x0000000000000000000000000000000000000000",
      FUTURE_END,
      false,
      false,
    ];
    vi.mocked(useReadContract).mockReturnValue({
      data: [tupleAuction],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data.length).to.equal(1);
    expect(result.current.data[0].id).to.equal("2");
  });

  it("formatTimeLeft shows days when more than 24h remain", () => {
    mockMarketplaceAddress = MARKETPLACE;
    const farFuture = BigInt(Math.floor(Date.now() / 1000) + 90000); // 25h
    vi.mocked(useReadContract).mockReturnValue({
      data: [{ ...mockRawAuction, endTime: farFuture }],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data[0].timeLeft).to.include("d");
  });

  it("formatTimeLeft shows hours when less than 24h remain", () => {
    mockMarketplaceAddress = MARKETPLACE;
    const fewHours = BigInt(Math.floor(Date.now() / 1000) + 3700); // ~1h
    vi.mocked(useReadContract).mockReturnValue({
      data: [{ ...mockRawAuction, endTime: fewHours }],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data[0].timeLeft).to.include("h");
  });

  it("formatTimeLeft shows 0m when auction is expired", () => {
    mockMarketplaceAddress = MARKETPLACE;
    const pastTime = BigInt(Math.floor(Date.now() / 1000) - 100);
    vi.mocked(useReadContract).mockReturnValue({
      data: [{ ...mockRawAuction, endTime: pastTime }],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useLiveAuctions());
    expect(result.current.data[0].timeLeft).to.equal("0m");
  });
});

describe("useMyAuctions", () => {
  it("returns empty array when no wallet address", () => {
    const { result } = renderHook(() => useMyAuctions(null));
    expect(result.current.data).to.deep.equal([]);
  });

  it("filters auctions by wallet address case-insensitively", () => {
    const { result } = renderHook(() => useMyAuctions("0xSELLER"));
    expect(result.current.data.length).to.equal(1);
  });

  it("returns empty when wallet does not match any auction", () => {
    const { result } = renderHook(() => useMyAuctions("0xother"));
    expect(result.current.data.length).to.equal(0);
  });
});

describe("useAuctionById", () => {
  it("returns mock auction when no marketplace configured", () => {
    const { result } = renderHook(() => useAuctionById("1"));
    expect(result.current.data?.name).to.equal("Mock Auction");
  });

  it("returns null for id not found in mocks", () => {
    const { result } = renderHook(() => useAuctionById("999"));
    expect(result.current.data).to.equal(null);
  });

  it("passes enabled false for non-numeric id", () => {
    mockMarketplaceAddress = MARKETPLACE;
    renderHook(() => useAuctionById("abc"));
    const call = vi.mocked(useReadContract).mock.lastCall?.[0] as { query?: { enabled?: boolean } };
    expect(call?.query?.enabled).to.be.false;
  });

  it("returns null when chain returns zero address seller", () => {
    mockMarketplaceAddress = MARKETPLACE;
    vi.mocked(useReadContract).mockReturnValue({
      data: {
        seller: "0x0000000000000000000000000000000000000000",
        nftContract: "0x0000000000000000000000000000000000000000",
        tokenId: BigInt(0),
        startPrice: BigInt(0),
        highestBid: BigInt(0),
        highestBidder: "0x0000000000000000000000000000000000000000",
        endTime: BigInt(0),
        ended: false,
        cancelled: false,
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useReadContract>);
    const { result } = renderHook(() => useAuctionById("1"));
    expect(result.current.data).to.equal(null);
  });
});
