"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Tailwind max-width class, e.g. `"max-w-md"`, `"max-w-xl"`. */
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
}

/**
 * Reusable modal shell: overlay, container, header (with Escape-to-close),
 * and a body slot. Used by ConfirmDialog and the form modals.
 */
export function Modal({
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-[540px]",
  children,
  closeOnOverlayClick = true,
  disableClose = false,
  headerIcon,
  headerClassName = "",
}: ModalProps) {
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
      className="fixed inset-0 z-[1000] grid place-items-center bg-[#25243a]/40 p-5 backdrop-blur-[4px] animate-[fadeIn_.2s_ease]"
      onClick={disableClose || !closeOnOverlayClick ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} rounded-xl border border-line bg-card shadow-[0_20px_60px_rgba(37,36,58,0.15)] animate-[slideUp_.25s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || headerIcon) && (
          <div className={`flex items-center justify-between border-b border-[#f0eff3] px-6 py-5 ${headerClassName}`}>
            <div className="flex items-center gap-2">
              {headerIcon}
              {title && (
                <div>
                  <h2 className="m-0 text-lg font-semibold leading-[1.3] tracking-[-0.015em] text-ink">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 m-0 text-xs text-muted">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-md border-0 bg-transparent text-muted transition-all hover:rotate-90 hover:bg-[#f2f2f5] hover:text-purple"
              disabled={disableClose}
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** Styled modal body wrapper — use inside `<Modal>`. */
export function ModalBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/** Styled modal footer wrapper — use inside `<Modal>`. */
export function ModalFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-6 flex justify-end gap-2.5 border-t border-line pt-3 ${className}`}>
      {children}
    </div>
  );
}
