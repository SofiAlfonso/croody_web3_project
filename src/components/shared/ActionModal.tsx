import type { ReactNode } from "react";

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}

export default function ActionModal({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isConfirming = false,
  onCancel,
  onConfirm,
  children,
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-lg font-semibold text-neutral-900">{title}</div>
        <div className="mt-1 text-sm text-neutral-500">{description}</div>
        {children}
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="flex-1 rounded-lg bg-gator-500 px-4 py-2 text-sm text-white hover:bg-gator-700"
            type="button"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
