import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSendTokens } from "@/hooks/useSendTokens";

const mockWriteContractAsync = vi.fn();
const mockSwitchChainAsync = vi.fn();
let mockIsDemo = false;

vi.mock("wagmi", () => ({
  useWriteContract: () => ({ writeContractAsync: mockWriteContractAsync }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync }),
}));

vi.mock("@/context/WalletContext", () => ({
  useWalletContext: () => ({ isDemo: mockIsDemo }),
}));

vi.mock("@/lib/contracts", () => ({
  getProjectTokenAddress: () => "0x9A676e781A523b5d0C0e43731313A708CB607508",
  ERC20_ABI: [],
}));

const VALID_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const VALID_PARAMS = {
  fromWallet: "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899",
  toWallet: VALID_RECIPIENT,
  amount: "100",
};

describe("useSendTokens", () => {
  beforeEach(() => {
    mockIsDemo = false;
    mockWriteContractAsync.mockResolvedValue("0xabc123hash");
    mockSwitchChainAsync.mockResolvedValue(undefined);
  });

  it("initial state: isPending false, error null", () => {
    const { result } = renderHook(() => useSendTokens());
    expect(result.current.isPending).to.be.false;
    expect(result.current.error).to.be.null;
  });

  it("returns error for invalid recipient address", async () => {
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens({ ...VALID_PARAMS, toWallet: "not-an-address" });
    });
    expect(sendResult!.success).to.be.false;
    if (!sendResult!.success) expect(sendResult!.error).to.equal("Invalid recipient address");
    expect(result.current.error).to.equal("Invalid recipient address");
  });

  it("returns error for amount 0", async () => {
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens({ ...VALID_PARAMS, amount: "0" });
    });
    expect(sendResult!.success).to.be.false;
    if (!sendResult!.success) expect(sendResult!.error).to.equal("Amount must be greater than 0");
  });

  it("returns error for negative amount", async () => {
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens({ ...VALID_PARAMS, amount: "-50" });
    });
    expect(sendResult!.success).to.be.false;
    if (!sendResult!.success) expect(sendResult!.error).to.equal("Amount must be greater than 0");
  });

  it("demo mode returns success without calling blockchain", async () => {
    mockIsDemo = true;
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens(VALID_PARAMS);
    });
    expect(sendResult!.success).to.be.true;
    if (sendResult!.success) expect(sendResult!.hash).to.be.undefined;
    expect(mockWriteContractAsync).not.toHaveBeenCalled();
    expect(mockSwitchChainAsync).not.toHaveBeenCalled();
  });

  it("real wallet: returns success with hash", async () => {
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens(VALID_PARAMS);
    });
    expect(sendResult!.success).to.be.true;
    if (sendResult!.success) expect(sendResult!.hash).to.equal("0xabc123hash");
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 31337 });
    expect(mockWriteContractAsync).toHaveBeenCalled();
  });

  it("real wallet: returns error when transaction fails", async () => {
    mockWriteContractAsync.mockRejectedValue(new Error("User rejected"));
    const { result } = renderHook(() => useSendTokens());
    let sendResult: Awaited<ReturnType<typeof result.current.sendTokens>>;
    await act(async () => {
      sendResult = await result.current.sendTokens(VALID_PARAMS);
    });
    expect(sendResult!.success).to.be.false;
    if (!sendResult!.success) expect(sendResult!.error).to.equal("Transaction failed");
    expect(result.current.error).to.equal("Transaction failed");
  });

  it("isPending is true while sending and false after", async () => {
    let resolveTx!: () => void;
    mockWriteContractAsync.mockReturnValue(new Promise((r) => { resolveTx = () => r("0xhash"); }));
    const { result } = renderHook(() => useSendTokens());

    act(() => { result.current.sendTokens(VALID_PARAMS); });
    expect(result.current.isPending).to.be.true;

    await act(async () => { resolveTx(); });
    expect(result.current.isPending).to.be.false;
  });
});
