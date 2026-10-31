"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger styling (red) — default `true`. */
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Extra content rendered between description and footer (e.g. a preview box). */
  children?: ReactNode;
  /** Optional warning box rendered after children. */
  warning?: string;
}

/**
 * Confirmation dialog for critical actions (delete, remove, etc.).
 * Replaces the custom `DeleteUserModal` and all `window.confirm()` calls.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
  children,
  warning,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <Modal
      onClose={onClose}
      disableClose={loading}
      size="sm"
      title={title}
      headerIcon={
        variant === "danger" ? (
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
        ) : undefined
      }
      headerClassName={variant === "danger" ? "text-danger" : ""}
    >
      <ModalBody className="space-y-4">
        {description && <p className="m-0 text-sm text-ink">{description}</p>}
        {children}
        {warning && (
          <div className="rounded-lg border border-danger-border bg-danger-bg p-3 text-xs text-danger">
            {warning}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" disabled={loading} onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          disabled={loading}
          loading={loading}
          onClick={onConfirm}
        >
          {loading ? `${confirmLabel}...` : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
