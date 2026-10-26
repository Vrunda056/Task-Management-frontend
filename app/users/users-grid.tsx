"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Mail,
  Copy,
  Check,
  Calendar,
  Briefcase,
} from "lucide-react";
import type { UserResponse } from "@/lib/users/user.schema";
import { formatMemberDate, getAvatarVariant, getInitials } from "./user-utils";

interface UsersGridProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  isDeleting: boolean;
}

export function UsersGrid({
  users,
  onEdit,
  onDelete,
  isDeleting,
}: UsersGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopyEmail(user: UserResponse) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(user.email);
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => {
        const avatarClass = getAvatarVariant(user.name);
        const initials = getInitials(user.name);
        const isCopied = copiedId === user.id;

        return (
          <div
            key={user.id}
            className="flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-xs hover:border-purple hover:shadow-sm transition-all"
          >
            <div>
              {/* Card Header with Avatar and Actions */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <span
                  className={`avatar ${avatarClass} !w-12 !h-12 !text-sm font-bold shadow-2xs`}
                >
                  {initials}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    className="action-btn !h-7 !px-2 text-xs"
                    onClick={() => onEdit(user)}
                    title="Edit member"
                    type="button"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn action-delete !h-7 !px-2 text-xs"
                    disabled={isDeleting}
                    onClick={() => onDelete(user)}
                    title="Remove member"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Member Name & Role */}
              <div className="space-y-1.5">
                <h3 className="font-semibold text-ink text-base truncate">
                  {user.name}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-canvas border border-line text-ink">
                  <Briefcase className="w-3 h-3 text-muted shrink-0" />
                  <span className="truncate max-w-[200px]">{user.position}</span>
                </div>
              </div>

              {/* Email Address */}
              <div className="mt-4 flex items-center justify-between gap-2 p-2 rounded-lg bg-canvas border border-line text-xs">
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-1.5 text-ink hover:text-purple transition-colors truncate flex-1"
                  title={`Send email to ${user.email}`}
                >
                  <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span className="truncate">{user.email}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyEmail(user)}
                  className="p-1 rounded text-muted hover:text-ink hover:bg-card transition-colors cursor-pointer"
                  title={isCopied ? "Email copied!" : "Copy email"}
                  aria-label="Copy email"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer / Meta */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {formatMemberDate(user.createdAt)}
              </span>
              <span className="font-mono text-[10px] text-muted">
                #{user.id.slice(0, 6)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
