"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layers, Lock, Shield } from "lucide-react";
import { useWalletContext } from "@/context/WalletContext";
import AppHeader from "@/components/shared/AppHeader";

export default function HomeClient() {
  const router = useRouter();
  const { isConnected, isConnecting, connectWallet, connectDemo } = useWalletContext();

  // If already connected, redirect to dashboard
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  const onConnectClick = async () => {
    const address = await connectWallet();
    if (address) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Header */}
      <AppHeader
        title="Croody"
        maxWidthClassName="max-w-7xl"
        borderClassName="border-jungle-100"
        titleClassName="text-jungle-900"
      >
        <button
          onClick={onConnectClick}
          disabled={isConnecting}
          className="bg-gator-500 hover:bg-gator-700 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-60"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </AppHeader>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-jungle-900 mb-6 text-5xl font-bold">
            Your Web3 Wallet & NFT Auction Ecosystem
          </h1>
          <p className="text-jungle-500 mb-6 text-xl">
            Manage tokens, own NFTs, and participate in decentralized auctions — securely and
            transparently.
          </p>

          <button
            onClick={onConnectClick}
            disabled={isConnecting}
            className="bg-gator-500 hover:bg-gator-700 rounded-lg px-8 py-4 text-lg text-white transition-colors disabled:opacity-60"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>

          <p className="text-jungle-500 mt-3 text-sm">Wallet not connected</p>

          <button
            onClick={() => {
              connectDemo();
              router.push("/dashboard");
            }}
            className="border-jungle-200 text-jungle-500 hover:bg-jungle-100 mt-4 rounded-lg border px-6 py-2 text-sm transition-colors"
          >
            Enter Demo Mode
          </button>

          {/* Info Row */}
          <div className="text-jungle-500 mt-16 flex items-center justify-center gap-12">
            <div className="flex items-center gap-2">
              <Shield className="text-gator-700 h-5 w-5" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-gator-700 h-5 w-5" />
              <span className="text-sm">Non-custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="text-gator-700 h-5 w-5" />
              <span className="text-sm">Built on blockchain</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-jungle-100 border-t bg-white py-4">
        <div className="text-jungle-500 mx-auto max-w-7xl px-6 text-center text-sm">
          Powered by Croody
        </div>
      </footer>
    </div>
  );
}
