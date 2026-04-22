"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ImageOff } from "lucide-react";
import { useWalletContext } from "@/context/WalletContext";
import { useMyNfts } from "@/hooks/useNfts";
import AppHeader from "@/components/shared/AppHeader";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";

const COLLECTIONS = ["All", "Croody Genesis", "Neon Relics", "Pixel Degens"] as const;

export default function NftGallery() {
  const router = useRouter();
  const { walletAddress, isConnected, isDemo } = useWalletContext();

  // Protect route
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const { data: nfts, isLoading } = useMyNfts(walletAddress);

  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string>("All");

  const filtered = useMemo(() => {
    return nfts.filter((nft) => {
      const matchesSearch =
        nft.name.toLowerCase().includes(search.toLowerCase()) ||
        nft.id.toLowerCase().includes(search.toLowerCase());
      const matchesCollection = activeCollection === "All" || nft.collection === activeCollection;
      return matchesSearch && matchesCollection;
    });
  }, [nfts, search, activeCollection]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader
        title="My NFTs"
        sticky
        maxWidthClassName="max-w-7xl"
        borderClassName="border-jungle-100"
        titleClassName="text-jungle-900"
        rightClassName="flex items-center gap-3"
      >
        {isDemo && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            Demo
          </span>
        )}
        <BackToDashboardLink />
      </AppHeader>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Search + Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="text-jungle-500 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-jungle-100 text-jungle-900 placeholder:text-jungle-500 focus:ring-gator-300 w-full rounded-lg border bg-white py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Collection Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setActiveCollection(col)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeCollection === col
                    ? "bg-gator-500 text-white"
                    : "border-jungle-100 text-jungle-500 font-medium hover:bg-neutral-50 border bg-white"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-jungle-500 text-sm">
          {isLoading
            ? "Loading…"
            : `${filtered.length} NFT${filtered.length === 1 ? "" : "s"} found`}
        </div>

        {/* Grid */}
        {(() => {
          if (isLoading) return <SkeletonGrid />;
          if (filtered.length === 0) return <EmptyState search={search} />;
          return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((nft) => (
                <Link
                  key={nft.id}
                  href={`/nfts/${nft.id}`}
                  className="group border-jungle-100 hover:border-gator-300 overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md"
                >
                  <div className="bg-jungle-100 relative aspect-square overflow-hidden">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-jungle-900 mb-1 truncate font-medium">{nft.name}</div>
                    <div className="text-jungle-500 font-medium text-xs">ID: {nft.id}</div>
                    {nft.collection && (
                      <div className="bg-jungle-50 text-jungle-500 mt-2 inline-block rounded-full px-2 py-0.5 text-xs">
                        {nft.collection}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
}

function SkeletonGrid() {
  const skeletons = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {skeletons.map((key) => (
        <div
          key={key}
          className="border-jungle-100 animate-pulse overflow-hidden rounded-xl border bg-white"
        >
          <div className="bg-jungle-100 aspect-square" />
          <div className="space-y-2 p-4">
            <div className="bg-jungle-100 h-4 w-3/4 rounded" />
            <div className="bg-jungle-50 h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: Readonly<{ search: string }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="bg-jungle-50 flex h-16 w-16 items-center justify-center rounded-full">
        <ImageOff className="text-jungle-300 h-8 w-8" />
      </div>
      <div className="text-jungle-900 text-xl font-semibold">No NFTs found</div>
      <div className="text-jungle-500 max-w-xs text-sm">
        {search
          ? `No NFTs match "${search}". Try a different search term.`
          : "This wallet doesn't own any NFTs yet."}
      </div>
    </div>
  );
}
