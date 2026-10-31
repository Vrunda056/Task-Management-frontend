"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "max-w-md",       // ~448px (confirmations, small prompts)
  md: "max-w-[540px]",  // ~540px (standard single-column forms)
  lg: "max-w-2xl",      // ~672px (forms with side-by-side fields or dynamic items)
  xl: "max-w-3xl",      // ~768px (multi-section forms)
  full: "max-w-4xl",    // ~896px
};

export interface ModalProps {
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Size preset: sm (448px), md (540px), lg (672px), xl (768px), full (896px). Default: "md" */
  size?: ModalSize;
  /** Custom Tailwind max-width class to override size preset, e.g. `"max-w-lg"` */
  maxWidth?: string;
  children: ReactNode;
  /** Close when the overlay is clicked — default `true`. */
  closeOnOverlayClick?: boolean;
  /** Disable all close interactions (use while a mutation is in-flight). */
  disableClose?: boolean;
  /** Icon shown before the title in the header. */
  headerIcon?: ReactNode;
  /** Extra classes on the header row. */
  headerClassName?: string;
  /** Extra classes on the modal container card. */
  className?: string;
}

/**
 * Scalable modal shell:
 * - Locks background document scroll when mounted.
 * - Enforces bounded viewport height (`max-h-[min(90vh,calc(100vh-2.5rem))]`).
 * - Pins header and footer permanently so action buttons never disappear off-screen.
 * - Automatically enables smooth internal scrolling for form bodies as content grows.
 */
export function Modal({
  onClose,
  title,
  subtitle,
  size = "md",
  maxWidth,
  children,
  closeOnOverlayClick = true,
  disableClose = false,
  headerIcon,
  headerClassName = "",
  className = "",
}: ModalProps) {
  const resolvedMaxWidth = maxWidth || SIZE_MAP[size];

  // Prevent background page scrolling while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (disableClose) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, disableClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-[#201e33]/50 backdrop-blur-[4px] animate-[fadeIn_.2s_ease]"
      onClick={disableClose || !closeOnOverlayClick ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${resolvedMaxWidth} flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[min(90vh,calc(100vh-2.5rem))] rounded-2xl border border-line bg-card shadow-[0_24px_70px_rgba(32,30,51,0.22)] overflow-hidden animate-[slideUp_.25s_ease] [&>form]:flex [&>form]:flex-col [&>form]:flex-1 [&>form]:min-h-0 [&>form]:overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Sticky Header */}
        {(title || headerIcon) && (
          <div
            className={`flex shrink-0 items-center justify-between border-b border-line/80 px-5 py-4 sm:px-6 sm:py-4.5 bg-card z-10 ${headerClassName}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
              {headerIcon}
              {title && (
                <div className="min-w-0">
                  <h2 className="m-0 text-lg font-semibold leading-tight tracking-[-0.015em] text-ink">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 m-0 text-xs leading-relaxed text-muted">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted transition-all hover:bg-slate-100 hover:text-ink cursor-pointer"
              disabled={disableClose}
              onClick={onClose}
              aria-label="Close modal"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scalable Content Area */}
        {children}
      </div>
    </div>
  );
}

/**
 * Scrollable modal body wrapper — use inside `<Modal>` or `<form>`.
 * Handles vertical overflow cleanly with custom scrollbar, guaranteeing
 * the header and footer remain pinned regardless of content length.
 */
export function ModalBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`modal-scroll flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Pinned modal footer wrapper — use inside `<Modal>` or `<form>`.
 * Remains pinned at the bottom of the modal, ensuring Cancel and Submit
 * actions are always visible and accessible even on long forms.
 */
export function ModalFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 flex items-center justify-end gap-2.5 border-t border-line/80 bg-card px-5 py-3.5 sm:px-6 sm:py-4 z-10 ${className}`}
    >
      {children}
    </div>
  );
}
