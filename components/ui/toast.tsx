"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

type ToastHandler = (
  message: string,
  variant?: ToastVariant,
  duration?: number,
) => void;

let globalToastHandler: ToastHandler | null = null;

/**
 * Trigger a toast notification from anywhere in the application,
 * including outside React components (e.g. TanStack Query cache, API interceptors).
 */
export function showGlobalToast(
  message: string,
  variant: ToastVariant = "error",
  duration = 4000,
) {
  if (globalToastHandler) {
    globalToastHandler(message, variant, duration);
  } else {
    console.warn("showGlobalToast called before ToastProvider was mounted:", message);
  }
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number,
  ) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * ToastProvider wraps the application and renders the floating toast container.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success", duration = 4000) => {
      console.log("[Toast]", { message, variant, duration });
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  // Sync the global dispatcher with the mounted showToast function
  useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
    }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the global toast system from any component.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * ToastContainer renders floating toast notifications in the bottom-right corner.
 */
function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: typeof CheckCircle2 }
> = {
  success: {
    container: "border-success-border bg-[#ecfdf5] text-success",
    icon: CheckCircle2,
  },
  error: {
    container: "border-danger-border bg-[#fff0f0] text-danger",
    icon: AlertCircle,
  },
  warning: {
    container: "border-amber-300 bg-[#fffbeb] text-amber-800",
    icon: AlertTriangle,
  },
  info: {
    container: "border-purple-200 bg-[#f5f3ff] text-purple-900",
    icon: Info,
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const style = variantStyles[toast.variant] || variantStyles.info;
  const Icon = style.icon;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-xl transition-all duration-200 animate-[slideInDown_0.25s_ease-out] ${style.container}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate leading-tight">{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
