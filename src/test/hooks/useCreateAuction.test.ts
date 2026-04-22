import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateAuction } from "@/hooks/useCreateAuction";

const mockWriteContractAsync = vi.fn();
const mockSwitchChainAsync = vi.fn();
const mockWaitForTransactionReceipt = vi.fn();
let mockMarketplaceAddress: string | null = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
let mockNftAddress: string | null = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let mockPublicClient: { waitForTransactionReceipt: ReturnType<typeof vi.fn> } | null = null;

vi.mock("wagmi", () => ({
  useWriteContract: () => ({ writeContractAsync: mockWriteContractAsync }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync }),
  usePublicClient: () => mockPublicClient,
}));

vi.mock("wagmi/chains", async () => vi.importActual("wagmi/chains"));
vi.mock("viem", async () => vi.importActual("viem"));

vi.mock("@/lib/contracts", () => ({
  getMarketplaceAddress: () => mockMarketplaceAddress,
  getNftCollectionAddress: () => mockNftAddress,
}));

const VALID_PARAMS = { nftId: "1", minimumBid: "100", durationHours: 24 };

beforeEach(() => {
  mockMarketplaceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  mockNftAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  mockWriteContractAsync
    .mockResolvedValueOnce("0xapprove-hash")
    .mockResolvedValueOnce("0xcreate-hash");
  mockSwitchChainAsync.mockResolvedValue(undefined);
  mockWaitForTransactionReceipt.mockResolvedValue({ logs: [] });
  mockPublicClient = { waitForTransactionReceipt: mockWaitForTransactionReceipt };
});

describe("useCreateAuction", () => {
  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => useCreateAuction());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error when addresses not configured", async () => {
    mockMarketplaceAddress = null;
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("not configured");
  });

  it("calls switchChain, approve NFT, then createAuction", async () => {
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.txHash).to.equal("0xcreate-hash");
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 31337 });
    expect(mockWriteContractAsync).toHaveBeenNthCalledWith(1,
      expect.objectContaining({ functionName: "approve" }),
    );
    expect(mockWriteContractAsync).toHaveBeenNthCalledWith(2,
      expect.objectContaining({ functionName: "createAuction" }),
    );
  });

  it("returns success with undefined auctionId when no matching event log", async () => {
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.auctionId).to.be.undefined;
  });

  it("returns error when publicClient is not available", async () => {
    mockPublicClient = null;
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("Public client not available");
  });

  it("silently ignores undecodable log entries in receipt", async () => {
    mockWaitForTransactionReceipt
      .mockResolvedValueOnce({ logs: [] })
      .mockResolvedValueOnce({ logs: [{ data: "0xdeadbeef", topics: ["0xbadtopic"] }] });
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.auctionId).to.be.undefined;
  });

  it("returns error when approve fails", async () => {
    mockWriteContractAsync.mockReset();
    mockWriteContractAsync.mockRejectedValue(new Error("Not NFT owner"));
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Not NFT owner");
  });

  it("uses fallback message when rejection is not an Error instance", async () => {
    mockWriteContractAsync.mockReset();
    mockWriteContractAsync.mockRejectedValue("unknown");
    const { result } = renderHook(() => useCreateAuction());
    let res: Awaited<ReturnType<typeof result.current.createAuction>>;
    await act(async () => { res = await result.current.createAuction(VALID_PARAMS); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Failed to create auction");
  });
});
