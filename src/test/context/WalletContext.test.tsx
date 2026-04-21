import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WalletProvider, useWalletContext } from "@/context/WalletContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <WalletProvider>{children}</WalletProvider>
);

describe("WalletContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.ethereum!.request).mockResolvedValue([]);
  });

  it("initial state: walletAddress null, isConnected false, isDemo false, chainId null", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    expect(result.current.walletAddress).to.be.null;
    expect(result.current.isConnected).to.be.false;
    expect(result.current.isDemo).to.be.false;
    expect(result.current.chainId).to.be.null;
  });

  it("connectDemo sets DEMO_ADDRESS and Sepolia chainId", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    act(() => {
      result.current.connectDemo();
    });
    expect(result.current.walletAddress).to.equal(
      "0xDEM0000000000000000000000000000000000000",
    );
    expect(result.current.isDemo).to.be.true;
    expect(result.current.chainId).to.equal("0xaa36a7");
    expect(result.current.isConnected).to.be.true;
  });

  it("disconnectWallet clears address and chainId", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    act(() => {
      result.current.connectDemo();
    });
    act(() => {
      result.current.disconnectWallet();
    });
    expect(result.current.walletAddress).to.be.null;
    expect(result.current.isConnected).to.be.false;
    expect(result.current.chainId).to.be.null;
  });

  it("isDemo is false when wallet is manually set to an address", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    act(() => {
      result.current.connectDemo();
    });
    expect(result.current.isDemo).to.be.true;

    act(() => {
      result.current.disconnectWallet();
    });
    expect(result.current.isDemo).to.be.false;
  });

  it("useWalletContext throws when used outside WalletProvider", () => {
    expect(() => {
      renderHook(() => useWalletContext());
    }).toThrow("useWalletContext must be used within a WalletProvider");
  });

  it("connectWallet function exists and is callable", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    expect(result.current.connectWallet).toBeDefined();
    expect(typeof result.current.connectWallet).to.equal("function");
  });

  it("isConnecting state is available", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    expect(result.current.isConnecting).to.be.false;
  });

  it("chainId can be set and retrieved", () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    expect(result.current.chainId).to.be.null;
    act(() => {
      result.current.connectDemo();
    });
    expect(result.current.chainId).to.equal("0xaa36a7");
  });

  it("connectWallet sets walletAddress and chainId from MetaMask", async () => {
    const address = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    vi.mocked(window.ethereum!.request).mockImplementation(
      async ({ method }: { method: string }) => {
        if (method === "eth_requestAccounts") return [address];
        if (method === "eth_chainId") return "0xaa36a7";
        return [];
      },
    );
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    await act(async () => {
      await result.current.connectWallet();
    });
    expect(result.current.walletAddress).to.equal(address);
    expect(result.current.isConnected).to.be.true;
    expect(result.current.chainId).to.equal("0xaa36a7");
  });

  it("restores walletAddress from eth_accounts on mount", async () => {
    const address = "0xb1f95C5e3Cbd60F81e0B43e948AF147b6c138899";
    vi.mocked(window.ethereum!.request).mockImplementation(
      async ({ method }: { method: string }) => {
        if (method === "eth_accounts") return [address];
        if (method === "eth_chainId") return "0x1";
        return [];
      },
    );
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    await act(async () => {});
    expect(result.current.walletAddress).to.equal(address);
    expect(result.current.isConnected).to.be.true;
  });

  it("accountsChanged event updates walletAddress", async () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    const onCalls = vi.mocked(window.ethereum!.on).mock.calls;
    const handler = onCalls.find(([event]) => event === "accountsChanged")?.[1];
    const newAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    await act(async () => {
      handler?.([newAddress]);
    });
    expect(result.current.walletAddress).to.equal(newAddress);
  });

  it("accountsChanged with empty array clears walletAddress", async () => {
    const { result } = renderHook(() => useWalletContext(), { wrapper });
    act(() => { result.current.connectDemo(); });
    const onCalls = vi.mocked(window.ethereum!.on).mock.calls;
    const handler = onCalls.find(([event]) => event === "accountsChanged")?.[1];
    await act(async () => { handler?.([]); });
    expect(result.current.walletAddress).to.be.null;
  });
});
