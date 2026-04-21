import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const { mockReadContract } = vi.hoisted(() => ({
  mockReadContract: vi.fn(),
}));

let mockWalletAddress: string | null = null;
let mockIsDemo = false;

vi.mock("viem", async () => {
  const actual = await vi.importActual<typeof import("viem")>("viem");
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ readContract: mockReadContract })),
    http: vi.fn(),
  };
});

vi.mock("viem/chains", async () => {
  const actual = await vi.importActual<typeof import("viem/chains")>("viem/chains");
  return actual;
});

vi.mock("@/context/WalletContext", () => ({
  useWalletContext: () => ({
    walletAddress: mockWalletAddress,
    isConnected: Boolean(mockWalletAddress),
    isDemo: mockIsDemo,
  }),
}));

vi.mock("@/lib/contracts", () => ({
  getProjectTokenAddress: () => "0x9A676e781A523b5d0C0e43731313A708CB607508",
  ERC20_ABI: [],
}));

vi.mock("@/lib/balance-utils", () => ({
  formatBalance: (v: string) => v,
}));

describe("useWalletBalance", () => {
  beforeEach(() => {
    mockIsDemo = false;
    mockWalletAddress = null;
    mockReadContract.mockClear();
    mockReadContract.mockResolvedValue(BigInt("1000000000000000000000"));
  });

  it("returns 0 when wallet is not connected", () => {
    mockWalletAddress = null;
    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.amount).to.equal("0");
    expect(result.current.isLoading).to.be.false;
    expect(result.current.isError).to.be.false;
  });

  it("returns mock balance in demo mode", () => {
    mockIsDemo = true;
    mockWalletAddress = "0xDEM0000000000000000000000000000000000000";
    const { result } = renderHook(() => useWalletBalance());
    expect(result.current.amount).to.equal("1,250");
    expect(result.current.symbol).to.equal("CRD");
  });

  it("fetches and returns balance when connected", async () => {
    mockWalletAddress = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    const { result } = renderHook(() => useWalletBalance());
    await act(async () => {});
    expect(mockReadContract).toHaveBeenCalled();
    expect(result.current.isError).to.be.false;
  });

  it("sets isError when fetch fails", async () => {
    mockWalletAddress = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    mockReadContract.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useWalletBalance());
    await act(async () => {});
    expect(result.current.isError).to.be.true;
  });

  it("does not fetch when walletAddress is not a valid hex address", () => {
    mockWalletAddress = "invalid-address";
    mockIsDemo = false;
    renderHook(() => useWalletBalance());
    expect(mockReadContract).not.toHaveBeenCalled();
  });

  it("symbol is always CRD", async () => {
    mockWalletAddress = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    const { result } = renderHook(() => useWalletBalance());
    await act(async () => {});
    expect(result.current.symbol).to.equal("CRD");
  });
});
