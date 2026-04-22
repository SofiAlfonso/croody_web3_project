import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWallet } from "@/hooks/useWallet";

describe("useWallet", () => {
  it("initial state: not connected, not connecting", () => {
    const { result } = renderHook(() => useWallet());
    expect(result.current.walletAddress).to.be.null;
    expect(result.current.isConnected).to.be.false;
    expect(result.current.isConnecting).to.be.false;
    expect(result.current.isDisconnecting).to.be.false;
  });

  it("initializes with provided wallet address", () => {
    const { result } = renderHook(() => useWallet({ initialWalletAddress: "0xabc" }));
    expect(result.current.walletAddress).to.equal("0xabc");
    expect(result.current.isConnected).to.be.true;
  });

  it("connectWallet sets a wallet address", async () => {
    const { result } = renderHook(() => useWallet());
    await act(async () => { await result.current.connectWallet(); });
    expect(result.current.walletAddress).to.not.be.null;
    expect(result.current.isConnected).to.be.true;
    expect(result.current.isConnecting).to.be.false;
  });

  it("disconnectWallet clears the wallet address", async () => {
    const { result } = renderHook(() => useWallet({ initialWalletAddress: "0xabc" }));
    await act(async () => { await result.current.disconnectWallet(); });
    expect(result.current.walletAddress).to.be.null;
    expect(result.current.isConnected).to.be.false;
    expect(result.current.isDisconnecting).to.be.false;
  });
});
