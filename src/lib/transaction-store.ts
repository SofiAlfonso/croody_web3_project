import type { TransactionType } from "./transaction-types";

export interface PendingTransaction {
  id: string;
  type: TransactionType;
  hash: `0x${string}` | undefined;
  timestamp: number;
  from: string;
  to: string;
  amount?: string;
  tokenId?: string;
  auctionId?: string;
  walletAddress: string;
}

const STORAGE_KEY = "croody_pending_txs";

function tryParse<T>(raw: string | null): T[] {
  try {
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function loadPendingTxs(): PendingTransaction[] {
  if (typeof window === "undefined") return [];
  return tryParse<PendingTransaction>(localStorage.getItem(STORAGE_KEY));
}

export function savePendingTx(tx: Omit<PendingTransaction, "timestamp">): void {
  if (typeof window === "undefined") return;
  const all = loadPendingTxs();
  all.unshift({ ...tx, timestamp: Math.floor(Date.now() / 1000) });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function removePendingTxByHash(hash: string): void {
  if (typeof window === "undefined") return;
  const filtered = loadPendingTxs().filter((t) => t.hash !== hash);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getPendingTxsForWallet(wallet: string): PendingTransaction[] {
  return loadPendingTxs().filter(
    (t) => t.walletAddress.toLowerCase() === wallet.toLowerCase(),
  );
}
