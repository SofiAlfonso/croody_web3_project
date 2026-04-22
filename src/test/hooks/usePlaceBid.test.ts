import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaceBid } from "@/hooks/usePlaceBid";

const mockWriteContractAsync = vi.fn();
const mockSwitchChainAsync = vi.fn();
const mockWaitForTransactionReceipt = vi.fn();
let mockMarketplaceAddress: string | null = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
let mockTokenAddress: string | null = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
  getProjectTokenAddress: () => mockTokenAddress,
}));

beforeEach(() => {
  mockMarketplaceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  mockTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  mockWriteContractAsync
    .mockResolvedValueOnce("0xapprove-hash")
    .mockResolvedValueOnce("0xbid-hash");
  mockSwitchChainAsync.mockResolvedValue(undefined);
  mockWaitForTransactionReceipt.mockResolvedValue({ status: "success" });
  mockPublicClient = { waitForTransactionReceipt: mockWaitForTransactionReceipt };
});

describe("usePlaceBid", () => {
  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => usePlaceBid());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error when addresses not configured", async () => {
    mockMarketplaceAddress = null;
    const { result } = renderHook(() => usePlaceBid());
    let res: Awaited<ReturnType<typeof result.current.placeBid>>;
    await act(async () => { res = await result.current.placeBid({ auctionId: "1", amount: "100" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("not configured");
  });

  it("calls approve then placeBid on success", async () => {
    const { result } = renderHook(() => usePlaceBid());
    let res: Awaited<ReturnType<typeof result.current.placeBid>>;
    await act(async () => { res = await result.current.placeBid({ auctionId: "1", amount: "100" }); });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.txHash).to.equal("0xbid-hash");
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 31337 });
    expect(mockWriteContractAsync).toHaveBeenCalledTimes(2);
    expect(mockWriteContractAsync).toHaveBeenNthCalledWith(1,
      expect.objectContaining({ functionName: "approve" }),
    );
    expect(mockWriteContractAsync).toHaveBeenNthCalledWith(2,
      expect.objectContaining({ functionName: "placeBid" }),
    );
  });

  it("returns error when publicClient is not available", async () => {
    mockPublicClient = null;
    const { result } = renderHook(() => usePlaceBid());
    let res: Awaited<ReturnType<typeof result.current.placeBid>>;
    await act(async () => { res = await result.current.placeBid({ auctionId: "1", amount: "100" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.include("Public client not available");
  });

  it("returns error when approve fails", async () => {
    mockWriteContractAsync.mockReset();
    mockWriteContractAsync.mockRejectedValue(new Error("Insufficient balance"));
    const { result } = renderHook(() => usePlaceBid());
    let res: Awaited<ReturnType<typeof result.current.placeBid>>;
    await act(async () => { res = await result.current.placeBid({ auctionId: "1", amount: "100" }); });
    expect(res!.success).to.be.false;
    expect(result.current.error).to.equal("Insufficient balance");
  });

  it("isPending is true during bid and false after", async () => {
    let resolveBid!: () => void;
    mockWriteContractAsync
      .mockResolvedValueOnce("0xapprove-hash")
      .mockReturnValueOnce(new Promise((r) => { resolveBid = () => r("0xbid-hash"); }));
    const { result } = renderHook(() => usePlaceBid());
    act(() => { result.current.placeBid({ auctionId: "1", amount: "100" }); });
    expect(result.current.isPending).to.be.true;
    await act(async () => { resolveBid(); });
    expect(result.current.isPending).to.be.false;
  });
});
