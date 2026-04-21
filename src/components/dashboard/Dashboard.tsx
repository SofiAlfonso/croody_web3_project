"use client";

import Link from "next/link";
import Image from "next/image";
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
  const filteredLiveAuctions = liveAuctions.filter(
    (auction) => auction.ownerAddress.toLowerCase() !== displayWallet.toLowerCase(),
  );
  const {
    amount: walletBalance,
    symbol: walletBalanceSymbol,
    isLoading: isLoadingBalance,
    isError: hasBalanceError,
  } = useWalletBalance();

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
        <div className="bg-jungle-100 text-jungle-500 rounded-lg px-4 py-2 font-mono text-sm">
          {isDemo ? "Demo User" : shortWallet}
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${isDemo ? "bg-yellow-100 text-yellow-700" : "bg-gator-100 text-gator-700"}`}
        >
          {isDemo ? "Demo" : "Connected"}
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-gator-500 hover:bg-gator-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
        >
          Disconnect
        </button>
      </AppHeader>

      {/* Demo Banner */}
      {isDemo && (
        <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-2 text-center text-sm text-yellow-700">
          Demo Mode — You are viewing with mock data. Connect a real wallet for full functionality.
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Token Balance Card */}
        <div className="border-jungle-100 rounded-xl border bg-white p-6">
          <div className="text-jungle-500 mb-2 text-sm">Token Balance</div>
          <div className="text-jungle-900 mb-1 text-4xl font-bold">
            {isLoadingBalance ? "Loading..." : `${walletBalance} ${walletBalanceSymbol}`}
          </div>
          <div className="text-jungle-500 mb-4 text-sm">Croody Token (CRD)</div>
          {hasBalanceError && (
            <div className="mb-4 text-sm text-red-600">
              Could not fetch on-chain balance. Verify your Hardhat network and wallet connection.
            </div>
          )}
          <Link
            href="/send"
            className="bg-gator-100 text-gator-700 hover:bg-gator-300 inline-flex rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Send Tokens
          </Link>
        </div>

        {/* My NFTs Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-jungle-900 text-2xl font-semibold">My NFTs</h2>
            <Link
              href="/nfts"
              className="text-jungle-500 hover:text-jungle-900 px-4 py-2 text-sm transition-colors"
            >
              View All NFTs →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nfts.length === 0 ? (
              <EmptySectionCard
                title="No NFTs yet"
                description="This wallet does not own NFTs right now."
                ctaHref="/nfts"
                ctaLabel="Open NFT Gallery"
              />
            ) : (
              nfts.map((nft) => (
                <Link
                  key={nft.id}
                  href={`/nfts/${nft.id}`}
                  className="border-jungle-100 hover:border-gator-300 overflow-hidden rounded-xl border bg-white text-left transition-colors"
                >
                  <div className="bg-jungle-100 relative aspect-square">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      className="h-full w-full object-cover"
                      fill
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-jungle-900 mb-1 font-medium">{nft.name}</div>
                    <div className="text-jungle-500 text-sm">ID: {nft.id}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My Auctions Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-jungle-900 text-2xl font-semibold">My Auctions</h2>
              <p className="text-jungle-500 text-sm">
                Manage auctions you own or are participating in.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myAuctions.length === 0 ? (
              <EmptySectionCard
                title="No auctions yet"
                description="Create an auction from an NFT detail page to see it here."
                ctaHref="/nfts"
                ctaLabel="Browse My NFTs"
              />
            ) : (
              myAuctions.map((auction) => {
                const isOwner = auction.ownerAddress === displayWallet;

                return (
                  <div
                    key={`my-auction-${auction.id}`}
                    className="border-jungle-100 overflow-hidden rounded-xl border bg-white"
                  >
                    <div className="bg-jungle-100 relative aspect-square">
                      <Image
                        src={auction.image}
                        alt={auction.name}
                        className="h-full w-full object-cover"
                        fill
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <div className="text-jungle-900 font-medium">{auction.name}</div>
                        <div className="text-jungle-500 text-sm">Status: {auction.status}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-jungle-500">Current Bid</span>
                        <span className="text-luks-primary font-semibold">
                          {auction.currentBid} CRD
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-jungle-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time Left
                        </span>
                        <span className="text-jungle-500 font-medium">{auction.timeLeft}</span>
                      </div>

                      {isOwner ? (
                        <div className="flex gap-2">
                          <button
                            className="bg-gator-100 text-gator-700 hover:bg-gator-300 flex-1 rounded-lg px-3 py-2 text-sm transition-colors"
                            type="button"
                          >
                            Close Auction
                          </button>
                          <button
                            className="border-jungle-100 text-jungle-700 flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                            type="button"
                          >
                            Cancel Auction
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/auction/${auction.id}`}
                          className="border-jungle-100 text-jungle-700 block w-full rounded-lg border px-3 py-2 text-center text-sm hover:bg-neutral-50"
                        >
                          View Auction
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Auctions Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-jungle-900 text-2xl font-semibold">Live NFT Auctions</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLiveAuctions.length === 0 ? (
              <EmptySectionCard
                title="No public live auctions"
                description="Your auctions are shown in My Auctions. Public auctions from other wallets appear here."
              />
            ) : (
              filteredLiveAuctions.map((auction) => (
                <div
                  key={auction.id}
                  className="border-jungle-100 overflow-hidden rounded-xl border bg-white"
                >
                  <div className="bg-jungle-100 relative aspect-square">
                    <Image
                      src={auction.image}
                      alt={auction.name}
                      className="h-full w-full object-cover"
                      fill
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-jungle-900 mb-3 font-medium">{auction.name}</div>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-jungle-500">Current Bid:</span>
                        <span className="text-luks-primary font-semibold">
                          {auction.currentBid} CRD
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-jungle-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time Left:
                        </span>
                        <span className="text-jungle-500 font-medium">{auction.timeLeft}</span>
                      </div>
                    </div>
                    <Link
                      href={`/auction/${auction.id}`}
                      className="bg-gator-500 hover:bg-gator-700 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
                    >
                      View Auction
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type EmptySectionCardProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function EmptySectionCard({ title, description, ctaHref, ctaLabel }: Readonly<EmptySectionCardProps>) {
  return (
    <div className="col-span-full rounded-xl border border-jungle-100 bg-white p-8 text-center">
      <div className="text-jungle-900 text-lg font-semibold">{title}</div>
      <div className="text-jungle-500 mt-2 text-sm">{description}</div>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="bg-gator-100 text-gator-700 hover:bg-gator-300 mt-4 inline-flex rounded-lg px-4 py-2 text-sm transition-colors"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
