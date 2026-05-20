"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Gavel,
  Tag,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useWalletContext } from "@/context/WalletContext";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import AppHeader from "@/components/shared/AppHeader";
import WalletBadge from "@/components/shared/WalletBadge";
import BackToDashboardLink from "@/components/shared/BackToDashboardLink";
import type { TransactionRecord, TransactionType } from "@/lib/transaction-types";

type TypeFilter = "all" | "tokens" | "nfts" | "auctions";
type DirectionFilter = "all" | "sent" | "received";

function matchesTypeFilter(record: TransactionRecord, filter: TypeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "tokens") return record.type === "token_sent" || record.type === "token_received";
  if (filter === "nfts") return record.type === "nft_sent" || record.type === "nft_received";
  return record.type === "bid_placed" || record.type === "auction_created";
}

function matchesDirectionFilter(record: TransactionRecord, filter: DirectionFilter): boolean {
  if (filter === "all") return true;
  const sentTypes: TransactionType[] = ["token_sent", "nft_sent", "bid_placed", "auction_created"];
  if (filter === "sent") return sentTypes.includes(record.type);
  return record.type === "token_received" || record.type === "nft_received";
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAmount(record: TransactionRecord): string {
  if (record.type === "nft_sent" || record.type === "nft_received") {
    return `NFT #${record.tokenId ?? "?"}`;
  }
  if (record.amount !== undefined) {
    const num = parseFloat(record.amount);
    if (isNaN(num)) return `${record.amount} CRD`;
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} CRD`;
  }
  return "—";
}

function typeLabel(type: TransactionType): string {
  switch (type) {
    case "token_sent": return "Token Sent";
    case "token_received": return "Token Received";
    case "nft_sent": return "NFT Sent";
    case "nft_received": return "NFT Received";
    case "bid_placed": return "Bid Placed";
    case "auction_created": return "Auction Created";
  }
}

function TypeIcon({ type }: { type: TransactionType }) {
  const baseClass = "h-5 w-5";
  switch (type) {
    case "token_sent":
    case "nft_sent":
    case "auction_created":
      return <ArrowUpRight className={`${baseClass} text-gator-600`} />;
    case "token_received":
    case "nft_received":
      return <ArrowDownLeft className={`${baseClass} text-jungle-600`} />;
    case "bid_placed":
      return <Gavel className={`${baseClass} text-luks-primary`} />;
  }
}

function TypeBadge({ type }: { type: TransactionType }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (type) {
    case "token_sent":
      return <span className={`${base} bg-gator-100 text-gator-700`}>{typeLabel(type)}</span>;
    case "token_received":
      return <span className={`${base} bg-jungle-100 text-jungle-700`}>{typeLabel(type)}</span>;
    case "nft_sent":
      return <span className={`${base} bg-orange-100 text-orange-700`}>{typeLabel(type)}</span>;
    case "nft_received":
      return <span className={`${base} bg-purple-100 text-purple-700`}>{typeLabel(type)}</span>;
    case "bid_placed":
      return <span className={`${base} bg-yellow-100 text-yellow-700`}>{typeLabel(type)}</span>;
    case "auction_created":
      return <span className={`${base} bg-teal-100 text-teal-700`}>{typeLabel(type)}</span>;
  }
}

function StatusBadge({ status }: { status: "pending" | "confirmed" }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-gator-100 px-2.5 py-0.5 text-xs font-medium text-gator-700">
      Confirmed
    </span>
  );
}

function TransactionRow({ record }: { record: TransactionRecord }) {
  const isInbound = record.type === "token_received" || record.type === "nft_received";

  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4 last:border-b-0 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
          <TypeIcon type={record.type} />
        </div>
        <div className="space-y-1">
          <TypeBadge type={record.type} />
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            {isInbound ? (
              <>
                <span>From:</span>
                <span className="font-mono">{shortAddr(record.from)}</span>
              </>
            ) : (
              <>
                <span>To:</span>
                <span className="font-mono">{shortAddr(record.to)}</span>
              </>
            )}
          </div>
          {record.auctionId && (
            <div className="text-xs text-neutral-400">Auction #{record.auctionId}</div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        <div className="text-sm font-semibold text-neutral-800">{formatAmount(record)}</div>
        <div className="text-xs text-neutral-400">{formatDate(record.timestamp)}</div>
        <StatusBadge status={record.status} />
      </div>
    </div>
  );
}

const TYPE_TABS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tokens", label: "Tokens" },
  { key: "nfts", label: "NFTs" },
  { key: "auctions", label: "Auctions" },
];

const DIRECTION_OPTIONS: { key: DirectionFilter; label: string }[] = [
  { key: "all", label: "All directions" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
];

export default function TransactionHistory() {
  const router = useRouter();
  const { isConnected } = useWalletContext();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const { data, isLoading, error, refetch } = useTransactionHistory();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (!isConnected) return null;

  const filtered = data.filter(
    (r) => matchesTypeFilter(r, typeFilter) && matchesDirectionFilter(r, directionFilter),
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader
        title="Transaction History"
        sticky
        maxWidthClassName="max-w-5xl"
        rightClassName="flex items-center gap-3"
      >
        <BackToDashboardLink />
        <WalletBadge />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  typeFilter === tab.key
                    ? "bg-jungle-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            >
              {DIRECTION_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-neutral-400">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Loading transactions…
            </div>
          )}

          {!isLoading && error && (
            <div className="px-6 py-12 text-center">
              <div className="text-red-600 text-sm">{error}</div>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 text-sm text-neutral-500 underline hover:text-neutral-700"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Tag className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
              <div className="text-neutral-500 text-sm">
                {data.length === 0
                  ? "No transactions found for this wallet."
                  : "No transactions match the selected filters."}
              </div>
              {data.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setDirectionFilter("all");
                  }}
                  className="mt-3 text-sm text-jungle-600 underline hover:text-jungle-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div>
              <div className="border-b border-neutral-100 px-6 py-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
              </div>
              {filtered.map((record) => (
                <TransactionRow key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
