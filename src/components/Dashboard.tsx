"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useLiveAuctions, useMyAuctions } from "@/hooks/useAuctions";
import { useMyNfts } from "@/hooks/useNfts";

type Props = {
  walletAddress?: string | null;
};

export default function Dashboard({ walletAddress = null }: Props) {
  const router = useRouter();
  const { walletAddress: hookWallet, isDisconnecting, disconnectWallet } = useWallet({
    initialWalletAddress: walletAddress ?? "0xA3f...92B",
  });

  const displayWallet = hookWallet ?? "0xA3f...92B";
  const { data: nfts } = useMyNfts(displayWallet);
  const { data: myAuctions } = useMyAuctions(displayWallet);
  const { data: liveAuctions } = useLiveAuctions();

  const handleDisconnect = async () => {
    await disconnectWallet();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <header className="border-b border-jungle-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-jungle-900">Croody</div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-jungle-100 rounded-lg text-sm text-jungle-500 font-mono">
              {displayWallet}
            </div>
            <div className="px-3 py-1 bg-gator-100 text-gator-700 rounded-full text-xs font-medium">
              Connected
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gator-500 text-white rounded-lg hover:bg-gator-700 transition-colors disabled:opacity-60"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Token Balance Card */}
        <div className="bg-white rounded-xl border border-jungle-100 p-6">
          <div className="text-sm text-jungle-500 mb-2">Token Balance</div>
          {/* TODO: Replace with real on-chain token balance */}
          <div className="text-4xl font-bold text-jungle-900 mb-1">1,250 CRD</div>
          <div className="text-sm text-jungle-500 mb-4">Native Croody Token</div>
          <Link
            href="/send"
            className="px-4 py-2 bg-gator-100 text-gator-700 rounded-lg hover:bg-gator-300 transition-colors text-sm inline-flex"
          >
            {/* TODO: Navigate to send flow when route/page exists */}
            Send Tokens
          </Link>
        </div>

        {/* My NFTs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-jungle-900">My NFTs</h2>
            <button className="px-4 py-2 text-jungle-500 hover:text-jungle-900 transition-colors text-sm">
              View All NFTs →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TODO: Replace mock NFTs with wallet-owned NFTs from contract/indexer */}
            {nfts.map((nft) => (
              <Link
                key={nft.id}
                href={`/nft/${nft.id}`}
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
            {/* TODO: Replace mock auctions with wallet-related auctions */}
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
                          {/* TODO: Implement close auction contract action */}
                          Close Auction
                        </button>
                        <button
                          className="flex-1 px-3 py-2 rounded-lg border border-jungle-100 text-sm text-jungle-700 hover:bg-neutral-50"
                          type="button"
                        >
                          {/* TODO: Implement cancel auction contract action */}
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
            {/* TODO: Replace with live auctions fetched from backend/indexer */}
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