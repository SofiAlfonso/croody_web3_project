"use client";

import { useRouter } from "next/navigation";
import { useWalletContext } from "@/context/WalletContext";

export default function WalletBadge() {
  const router = useRouter();
  const { walletAddress, isDemo, disconnectWallet } = useWalletContext();

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="px-4 py-2 bg-jungle-100 rounded-lg text-sm text-jungle-500 font-mono">
        {isDemo ? "Demo User" : shortWallet}
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isDemo ? "bg-yellow-100 text-yellow-700" : "bg-gator-100 text-gator-700"
        }`}
      >
        {isDemo ? "Demo" : "Connected"}
      </div>
      <button
        onClick={handleDisconnect}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gator-500 text-white rounded-lg hover:bg-gator-700 transition-colors text-sm"
      >
        Disconnect
      </button>
    </div>
  );
}
