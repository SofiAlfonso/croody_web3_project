"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type TxToastStatus = "pending" | "confirmed" | "failed";

export interface TxToast {
  id: string;
  status: TxToastStatus;
  message: string;
  txHash?: string;
}

interface TxToastContextType {
  toasts: TxToast[];
  addToast: (message: string, status: TxToastStatus, txHash?: string) => string;
  updateToast: (
    id: string,
    status: TxToastStatus,
    message: string,
    txHash?: string,
  ) => void;
  removeToast: (id: string) => void;
}

const TxToastContext = createContext<TxToastContextType | null>(null);

const CONFIRMED_AUTO_DISMISS_MS = 4000;

export function TxToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<TxToast[]>([]);

  const addToast = useCallback(
    (message: string, status: TxToastStatus, txHash?: string): string => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, status, message, txHash }]);
      if (status === "confirmed") {
        setTimeout(
          () => setToasts((prev) => prev.filter((t) => t.id !== id)),
          CONFIRMED_AUTO_DISMISS_MS,
        );
      }
      return id;
    },
    [],
  );

  const updateToast = useCallback(
    (
      id: string,
      status: TxToastStatus,
      message: string,
      txHash?: string,
    ) => {
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status, message, ...(txHash !== undefined && { txHash }) }
            : t,
        ),
      );
      if (status === "confirmed") {
        setTimeout(
          () => setToasts((prev) => prev.filter((t) => t.id !== id)),
          CONFIRMED_AUTO_DISMISS_MS,
        );
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TxToastContext.Provider
      value={{ toasts, addToast, updateToast, removeToast }}
    >
      {children}
    </TxToastContext.Provider>
  );
}

export function useTxToast() {
  const ctx = useContext(TxToastContext);
  if (!ctx) throw new Error("useTxToast must be used within TxToastProvider");
  return ctx;
}
