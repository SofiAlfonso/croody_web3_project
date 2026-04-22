import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEndAuction } from "@/hooks/useEndAuction";
import { useCancelAuction } from "@/hooks/useCancelAuction";

const mockWriteContractAsync = vi.fn();
const mockSwitchChainAsync = vi.fn();
const mockWaitForTransactionReceipt = vi.fn();
let mockMarketplaceAddress: string | null = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
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
}));

beforeEach(() => {
  mockMarketplaceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  mockWriteContractAsync.mockResolvedValue("0xtxhash");
  mockSwitchChainAsync.mockResolvedValue(undefined);
  mockWaitForTransactionReceipt.mockResolvedValue({ status: "success" });
  mockPublicClient = { waitForTransactionReceipt: mockWaitForTransactionReceipt };
});

describe("useEndAuction", () => {
  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => useEndAuction());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error when marketplace not configured", async () => {
    mockMarketplaceAddress = null;
    const { result } = renderHook(() => useEndAuction());
    let res: Awaited<ReturnType<typeof result.current.endAuction>>;
    await act(async () => { res = await result.current.endAuction({ auctionId: "1" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("not configured");
  });

  it("calls switchChain, writeContract and waitForReceipt on success", async () => {
    const { result } = renderHook(() => useEndAuction());
    let res: Awaited<ReturnType<typeof result.current.endAuction>>;
    await act(async () => { res = await result.current.endAuction({ auctionId: "1" }); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.txHash).to.equal("0xtxhash");
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 31337 });
    expect(mockWriteContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "endAuction", args: [BigInt(1)] }),
    );
    expect(mockWaitForTransactionReceipt).toHaveBeenCalled();
  });

  it("returns error when publicClient is not available", async () => {
    mockPublicClient = null;
    const { result } = renderHook(() => useEndAuction());
    let res: Awaited<ReturnType<typeof result.current.endAuction>>;
    await act(async () => { res = await result.current.endAuction({ auctionId: "1" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("Public client not available");
  });

  it("returns error message when transaction fails with Error", async () => {
    mockWriteContractAsync.mockRejectedValue(new Error("User rejected"));
    const { result } = renderHook(() => useEndAuction());
    let res: Awaited<ReturnType<typeof result.current.endAuction>>;
    await act(async () => { res = await result.current.endAuction({ auctionId: "1" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("User rejected");
  });

  it("uses fallback message when rejection is not an Error instance", async () => {
    mockWriteContractAsync.mockRejectedValue("unexpected string error");
    const { result } = renderHook(() => useEndAuction());
    let res: Awaited<ReturnType<typeof result.current.endAuction>>;
    await act(async () => { res = await result.current.endAuction({ auctionId: "1" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Failed to close auction");
  });

  it("isPending is true while ending and false after", async () => {
    let resolveTx!: () => void;
    mockWriteContractAsync.mockReturnValue(new Promise((r) => { resolveTx = () => r("0xhash"); }));
    const { result } = renderHook(() => useEndAuction());
    act(() => { result.current.endAuction({ auctionId: "1" }); });
    expect(result.current.isPending).to.be.true;
    await act(async () => { resolveTx(); });
    expect(result.current.isPending).to.be.false;
  });
});

describe("useCancelAuction", () => {
  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => useCancelAuction());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error when marketplace not configured", async () => {
    mockMarketplaceAddress = null;
    const { result } = renderHook(() => useCancelAuction());
    let res: Awaited<ReturnType<typeof result.current.cancelAuction>>;
    await act(async () => { res = await result.current.cancelAuction({ auctionId: "2" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("not configured");
  });

  it("calls switchChain, writeContract and waitForReceipt on success", async () => {
    const { result } = renderHook(() => useCancelAuction());
    let res: Awaited<ReturnType<typeof result.current.cancelAuction>>;
    await act(async () => { res = await result.current.cancelAuction({ auctionId: "2" }); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.txHash).to.equal("0xtxhash");
    expect(mockWriteContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "cancelAuction", args: [BigInt(2)] }),
    );
  });

  it("returns error when publicClient is not available", async () => {
    mockPublicClient = null;
    const { result } = renderHook(() => useCancelAuction());
    let res: Awaited<ReturnType<typeof result.current.cancelAuction>>;
    await act(async () => { res = await result.current.cancelAuction({ auctionId: "2" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("Public client not available");
  });

  it("returns error message when transaction fails with Error", async () => {
    mockWriteContractAsync.mockRejectedValue(new Error("Auction has bids"));
    const { result } = renderHook(() => useCancelAuction());
    let res: Awaited<ReturnType<typeof result.current.cancelAuction>>;
    await act(async () => { res = await result.current.cancelAuction({ auctionId: "2" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Auction has bids");
  });

  it("uses fallback message when rejection is not an Error instance", async () => {
    mockWriteContractAsync.mockRejectedValue(42);
    const { result } = renderHook(() => useCancelAuction());
    let res: Awaited<ReturnType<typeof result.current.cancelAuction>>;
    await act(async () => { res = await result.current.cancelAuction({ auctionId: "2" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Failed to cancel auction");
  });
});
