"use client";

import { useCallback, useState } from "react";

export interface ToastState {
  message: string;
  variant: "success" | "error";
}

/**
 * Hook that manages toast state with auto-dismiss.
 * Replaces the duplicated `triggerToast` + `setTimeout` pattern in pages.
 */
export function useToast(duration = 3500) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      setToast({ message, variant });
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, duration);
    },
    [duration],
  );

  return { toast, showToast };
}

export interface ToastProps {
  toast: ToastState | null;
}

/**
 * Fixed toast notification rendered in the bottom-right corner.
 * Replaces the duplicated `toast toast-success` / `toast toast-error` markup.
 */
export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-[1001] rounded-md px-[18px] py-3 text-xs font-semibold shadow-[0_6px_24px_rgba(37,36,58,0.12)] animate-[slideInUp_.25s_ease] ${
        toast.variant === "error"
          ? "border border-danger-border bg-danger-bg text-danger"
          : "border border-success-border bg-success-bg text-success"
      }`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
