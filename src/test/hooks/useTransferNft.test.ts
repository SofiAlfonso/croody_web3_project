import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransferNft } from "@/hooks/useTransferNft";

const mockWriteContractAsync = vi.fn();
const mockSwitchChainAsync = vi.fn();
let mockWalletAddress: string | null = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
let mockIsDemo = false;

vi.mock("wagmi", () => ({
  useWriteContract: () => ({ writeContractAsync: mockWriteContractAsync }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync }),
}));

vi.mock("@/context/WalletContext", () => ({
  useWalletContext: () => ({
    walletAddress: mockWalletAddress,
    isDemo: mockIsDemo,
  }),
}));

vi.mock("@/lib/contracts", () => ({
  getNftCollectionAddress: () => "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  getMarketplaceAddress: () => null,
}));

const VALID_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const VALID_PARAMS = { nftId: "1", toWallet: VALID_RECIPIENT };

describe("useTransferNft", () => {
  beforeEach(() => {
    mockIsDemo = false;
    mockWalletAddress = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    mockWriteContractAsync.mockResolvedValue("0xtxhash123");
    mockSwitchChainAsync.mockResolvedValue(undefined);
  });

  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => useTransferNft());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error for invalid recipient address", async () => {
    const { result } = renderHook(() => useTransferNft());
    let res: Awaited<ReturnType<typeof result.current.transferNft>>;
    await act(async () => {
      res = await result.current.transferNft({ ...VALID_PARAMS, toWallet: "not-an-address" });
    });
    expect(res!.success).to.be.false;
    if (!res!.success) expect(res!.error).to.equal("Invalid recipient address");
    expect(result.current.error).to.equal("Invalid recipient address");
  });

  it("returns error when wallet is not connected", async () => {
    mockWalletAddress = null;
    const { result } = renderHook(() => useTransferNft());
    let res: Awaited<ReturnType<typeof result.current.transferNft>>;
    await act(async () => {
      res = await result.current.transferNft(VALID_PARAMS);
    });
    expect(res!.success).to.be.false;
    if (!res!.success) expect(res!.error).to.equal("Wallet not connected");
  });

  it("demo mode returns success without calling blockchain", async () => {
    mockIsDemo = true;
    const { result } = renderHook(() => useTransferNft());
    let res: Awaited<ReturnType<typeof result.current.transferNft>>;
    await act(async () => {
      res = await result.current.transferNft(VALID_PARAMS);
    });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.hash).to.equal("0xdemo");
    expect(mockWriteContractAsync).not.toHaveBeenCalled();
    expect(mockSwitchChainAsync).not.toHaveBeenCalled();
  });

  it("calls switchChain and safeTransferFrom with correct args", async () => {
    const { result } = renderHook(() => useTransferNft());
    let res: Awaited<ReturnType<typeof result.current.transferNft>>;
    await act(async () => {
      res = await result.current.transferNft(VALID_PARAMS);
    });
    expect(res!.success).to.be.true;
    if (res!.success) expect(res!.hash).to.equal("0xtxhash123");
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 31337 });
    expect(mockWriteContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "safeTransferFrom",
        args: [mockWalletAddress, VALID_RECIPIENT, BigInt(1)],
      }),
    );
  });

  it("returns error when transaction fails", async () => {
    mockWriteContractAsync.mockRejectedValue(new Error("User rejected"));
    const { result } = renderHook(() => useTransferNft());
    let res: Awaited<ReturnType<typeof result.current.transferNft>>;
    await act(async () => {
      res = await result.current.transferNft(VALID_PARAMS);
    });
    expect(res!.success).to.be.false;
    if (!res!.success) expect(res!.error).to.equal("Failed to transfer NFT");
    expect(result.current.error).to.equal("Failed to transfer NFT");
  });

  it("isPending is true while transferring and false after", async () => {
    let resolveTx!: () => void;
    mockWriteContractAsync.mockReturnValue(new Promise((r) => { resolveTx = () => r("0xhash"); }));
    const { result } = renderHook(() => useTransferNft());

    act(() => { result.current.transferNft(VALID_PARAMS); });
    expect(result.current.isPending).to.be.true;

    await act(async () => { resolveTx(); });
    expect(result.current.isPending).to.be.false;
  });
});
