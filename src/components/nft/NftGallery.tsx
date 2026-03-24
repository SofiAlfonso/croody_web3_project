"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
      const matchesCollection =
        activeCollection === "All" || nft.collection === activeCollection;
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
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Demo
          </span>
        )}
        <BackToDashboardLink />
      </AppHeader>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jungle-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-jungle-100 rounded-lg text-sm text-jungle-900 placeholder:text-jungle-400 focus:outline-none focus:ring-2 focus:ring-gator-300"
            />
          </div>

          {/* Collection Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {COLLECTIONS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setActiveCollection(col)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCollection === col
                    ? "bg-gator-500 text-white"
                    : "bg-white border border-jungle-100 text-jungle-600 hover:bg-jungle-50"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-jungle-500">
          {isLoading ? "Loading…" : `${filtered.length} NFT${filtered.length === 1 ? "" : "s"} found`}
        </div>

        {/* Grid */}
        {(() => {
          if (isLoading) return <SkeletonGrid />;
          if (filtered.length === 0) return <EmptyState search={search} />;
          return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((nft) => (
              <Link
                key={nft.id}
                href={`/nft/${nft.id}`}
                className="group bg-white rounded-xl border border-jungle-100 overflow-hidden hover:border-gator-300 hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-jungle-100 overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium text-jungle-900 mb-1 truncate">
                    {nft.name}
                  </div>
                  <div className="text-xs text-jungle-400">ID: {nft.id}</div>
                  {nft.collection && (
                    <div className="mt-2 inline-block px-2 py-0.5 bg-jungle-50 text-jungle-500 text-xs rounded-full">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {skeletons.map((key) => (
        <div key={key} className="bg-white rounded-xl border border-jungle-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-jungle-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-jungle-100 rounded w-3/4" />
            <div className="h-3 bg-jungle-50 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: Readonly<{ search: string }>) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-jungle-50 flex items-center justify-center">
        <ImageOff className="w-8 h-8 text-jungle-300" />
      </div>
      <div className="text-xl font-semibold text-jungle-900">No NFTs found</div>
      <div className="text-sm text-jungle-500 max-w-xs">
        {search
          ? `No NFTs match "${search}". Try a different search term.`
          : "This wallet doesn't own any NFTs yet."}
      </div>
    </div>
  );
}
