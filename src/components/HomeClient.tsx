"use client";

import { useRouter } from "next/navigation";
import { Layers, Lock, Shield } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

type Props = {
  initialWalletAddress?: string | null;
};

export default function HomeClient({ initialWalletAddress = null }: Props) {
  const router = useRouter();
  const { isConnecting, connectWallet } = useWallet({ initialWalletAddress });

  const onConnectClick = async () => {
    await connectWallet();
    // Foundation behavior: navigate to dashboard.
    // TODO: Replace with protected route/session-aware flow after real auth/wallet integration.
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-jungle-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-jungle-900">Croody</div>
          <button
            onClick={onConnectClick}
            disabled={isConnecting}
            className="px-4 py-2 bg-gator-500 text-white rounded-lg hover:bg-gator-700 transition-colors disabled:opacity-60"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold text-jungle-900 mb-6">
            Your Web3 Wallet & NFT Auction Ecosystem
          </h1>
          <p className="text-xl text-jungle-500 mb-6">
            Manage tokens, own NFTs, and participate in decentralized auctions — securely and transparently.
          </p>

          <button
            onClick={onConnectClick}
            disabled={isConnecting}
            className="px-8 py-4 bg-gator-500 text-white rounded-lg text-lg hover:bg-gator-700 transition-colors disabled:opacity-60"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>

          <p className="text-sm text-jungle-500 mt-3">Wallet not connected</p>

          {/* Info Row */}
          <div className="mt-16 flex items-center justify-center gap-12 text-jungle-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gator-700" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gator-700" />
              <span className="text-sm">Non-custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-gator-700" />
              <span className="text-sm">Built on blockchain</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-jungle-100 bg-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-jungle-500">
          Powered by Croody
        </div>
      </footer>
    </div>
  );
}