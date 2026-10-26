"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { UserResponse } from "@/lib/users/user.schema";
import { getAvatarVariant, getInitials } from "./user-utils";

interface DeleteUserModalProps {
  user: UserResponse;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (user: UserResponse) => void;
}

export function DeleteUserModal({
  user,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isDeleting]);

  return (
    <div
      className="modal-overlay"
      onClick={isDeleting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div
        className="modal-container max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 id="delete-user-title" className="!text-danger">
              Remove Member
            </h2>
          </div>
          <button
            className="modal-close"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-sm text-ink">
            Are you sure you want to remove this team member? This action cannot be
            undone.
          </p>

          {/* User Preview Box */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-canvas">
            <span className={`avatar ${getAvatarVariant(user.name)}`}>
              {getInitials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.position} · {user.email}</p>
            </div>
          </div>

          <div className="rounded-lg bg-danger-bg border border-danger-border p-3 text-xs text-danger">
            Removing this user will unassign their active tasks and remove their workspace access.
          </div>
        </div>

        <div className="modal-footer border-t border-line pt-3">
          <button
            className="btn btn-secondary"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="action-btn action-delete !h-[38px] !px-4 !text-sm"
            disabled={isDeleting}
            onClick={() => onConfirm(user)}
            type="button"
          >
            {isDeleting ? "Removing..." : "Remove Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
