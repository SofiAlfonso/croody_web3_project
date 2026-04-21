"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

const DEMO_ADDRESS = "0xDEM0000000000000000000000000000000000000";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDemo: boolean;
  connectWallet: () => Promise<string | null>;
  connectDemo: () => void;
  disconnectWallet: () => void;
  chainId: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  const isConnected = Boolean(walletAddress);

  // Check if already connected on mount (persists across page reloads)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      try {
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }

        const chain = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        setChainId(chain);
      } catch {
        // Silently fail — user hasn't connected yet
      }
    };

    checkConnection();
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const newChainId = args[0] as string;
      setChainId(newChainId);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return null;
    }

    setIsConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);

        const chain = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        setChainId(chain);

        return accounts[0];
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectDemo = useCallback(() => {
    setWalletAddress(DEMO_ADDRESS);
    setChainId("0xaa36a7"); // Sepolia
  }, []);

  const disconnectWallet = useCallback(() => {
    // Try to revoke MetaMask permissions so it doesn't auto-reconnect
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        })
        .catch(() => {
          // Not all wallets support this — silently ignore
        });
    }
    setWalletAddress(null);
    setChainId(null);
  }, []);

  const isDemo = walletAddress === DEMO_ADDRESS;

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        isConnecting,
        isDemo,
        connectWallet,
        connectDemo,
        disconnectWallet,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
