"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { useWalletContext } from "@/context/WalletContext";
import { useLiveAuctions, useMyAuctions } from "@/hooks/useAuctions";
import { useMyNfts } from "@/hooks/useNfts";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import AppHeader from "@/components/shared/AppHeader";

export default function Dashboard() {
  const router = useRouter();
  const { walletAddress, isConnected, isDemo, disconnectWallet } = useWalletContext();

  // Protect route: redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const displayWallet = walletAddress ?? "";
  const shortWallet = displayWallet
    ? `${displayWallet.slice(0, 6)}...${displayWallet.slice(-4)}`
    : "";

  const { data: nfts } = useMyNfts(displayWallet);
  const { data: myAuctions } = useMyAuctions(displayWallet);
  const { data: liveAuctions } = useLiveAuctions();
  const { amount: walletBalance, symbol: walletBalanceSymbol, isLoading: isLoadingBalance, isError: hasBalanceError } = useWalletBalance();

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <AppHeader
        title="Croody"
        sticky
        maxWidthClassName="max-w-7xl"
        borderClassName="border-jungle-100"
        titleClassName="text-jungle-900"
        rightClassName="flex items-center gap-3"
      >
        <div className="px-4 py-2 bg-jungle-100 rounded-lg text-sm text-jungle-500 font-mono">
          {isDemo ? "Demo User" : shortWallet}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDemo ? "bg-yellow-100 text-yellow-700" : "bg-gator-100 text-gator-700"}`}>
          {isDemo ? "Demo" : "Connected"}
        </div>
        <button
          onClick={handleDisconnect}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gator-500 text-white rounded-lg hover:bg-gator-700 transition-colors"
        >
          Disconnect
        </button>
      </AppHeader>

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-center text-sm text-yellow-700">
          Demo Mode — You are viewing with mock data. Connect a real wallet for full functionality.
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Token Balance Card */}
        <div className="bg-white rounded-xl border border-jungle-100 p-6">
          <div className="text-sm text-jungle-500 mb-2">Token Balance</div>
          <div className="text-4xl font-bold text-jungle-900 mb-1">
            {isLoadingBalance ? "Loading..." : `${walletBalance} ${walletBalanceSymbol}`}
          </div>
          <div className="text-sm text-jungle-500 mb-4">
            Croody Token (CRD)
          </div>
          {hasBalanceError && (
            <div className="text-sm text-red-600 mb-4">
              Could not fetch on-chain balance. Verify your Hardhat network and wallet connection.
            </div>
          )}
          <Link
            href="/send"
            className="px-4 py-2 bg-gator-100 text-gator-700 rounded-lg hover:bg-gator-300 transition-colors text-sm inline-flex"
          >
            Send Tokens
          </Link>
        </div>

        {/* My NFTs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-jungle-900">My NFTs</h2>
            <Link
              href="/nfts"
              className="px-4 py-2 text-jungle-500 hover:text-jungle-900 transition-colors text-sm"
            >
              View All NFTs →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nfts.map((nft) => (
              <Link
                key={nft.id}
                href={`/nfts/${nft.id}`}
                className="bg-white rounded-xl border border-jungle-100 overflow-hidden hover:border-gator-300 transition-colors text-left"
              >
                <div className="aspect-square bg-jungle-100">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium text-jungle-900 mb-1">{nft.name}</div>
                  <div className="text-sm text-jungle-500">ID: {nft.id}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Auctions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-jungle-900">My Auctions</h2>
              <p className="text-sm text-jungle-500">
                Manage auctions you own or are participating in.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myAuctions.map((auction) => {
              const isOwner = auction.ownerAddress === displayWallet;

              return (
                <div
                  key={`my-auction-${auction.id}`}
                  className="bg-white rounded-xl border border-jungle-100 overflow-hidden"
                >
                  <div className="aspect-square bg-jungle-100">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="font-medium text-jungle-900">{auction.name}</div>
                      <div className="text-sm text-jungle-500">Status: {auction.status}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-jungle-500">Current Bid</span>
                      <span className="font-semibold text-luks-primary">{auction.currentBid} CRD</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-jungle-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Time Left
                      </span>
                      <span className="font-medium text-jungle-500">{auction.timeLeft}</span>
                    </div>

                    {isOwner ? (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 rounded-lg bg-gator-100 text-gator-700 text-sm hover:bg-gator-300 transition-colors"
                          type="button"
                        >
                          Close Auction
                        </button>
                        <button
                          className="flex-1 px-3 py-2 rounded-lg border border-jungle-100 text-sm text-jungle-700 hover:bg-neutral-50"
                          type="button"
                        >
                          Cancel Auction
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/auction/${auction.id}`}
                        className="w-full px-3 py-2 rounded-lg border border-jungle-100 text-sm text-jungle-700 hover:bg-neutral-50 text-center block"
                      >
                        View Auction
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Auctions Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-jungle-900">Live NFT Auctions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-xl border border-jungle-100 overflow-hidden"
              >
                <div className="aspect-square bg-jungle-100">
                  <img
                    src={auction.image}
                    alt={auction.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium text-jungle-900 mb-3">{auction.name}</div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-jungle-500">Current Bid:</span>
                      <span className="font-semibold text-luks-primary">{auction.currentBid} CRD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-jungle-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Time Left:
                      </span>
                      <span className="font-medium text-jungle-500">{auction.timeLeft}</span>
                    </div>
                  </div>
                  <Link
                    href={`/auction/${auction.id}`}
                    className="w-full px-4 py-2 bg-gator-500 text-white rounded-lg hover:bg-gator-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    View Auction
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
