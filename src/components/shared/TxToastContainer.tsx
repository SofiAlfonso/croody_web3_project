"use client";

import { Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { useTxToast, type TxToast, type TxToastStatus } from "@/context/TxToastContext";

const STATUS_CONFIG: Record<
  TxToastStatus,
  { containerClass: string; textClass: string; icon: React.ReactNode }
> = {
  pending: {
    containerClass: "border-amber-200 bg-amber-50",
    textClass: "text-amber-800",
    icon: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />,
  },
  confirmed: {
    containerClass: "border-emerald-200 bg-emerald-50",
    textClass: "text-emerald-800",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  },
  failed: {
    containerClass: "border-red-200 bg-red-50",
    textClass: "text-red-800",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: TxToast;
  onDismiss: () => void;
}) {
  const { containerClass, textClass, icon } = STATUS_CONFIG[toast.status];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${containerClass}`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${textClass}`}>{toast.message}</p>
        {toast.txHash && (
          <p className="mt-0.5 truncate font-mono text-xs text-neutral-400">
            {toast.txHash.slice(0, 10)}...{toast.txHash.slice(-6)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="mt-0.5 shrink-0 text-neutral-400 hover:text-neutral-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function TxToastContainer() {
  const { toasts, removeToast } = useTxToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
