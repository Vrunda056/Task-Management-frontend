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

interface UsersTableProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  isDeleting: boolean;
}

export function UsersTable({
  users,
  onEdit,
  onDelete,
  isDeleting,
}: UsersTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopyEmail(user: UserResponse) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(user.email);
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  }

  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Job Title</th>
              <th>Access Role</th>
              <th>Email Address</th>
              <th>Joined Date</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const avatarClass = getAvatarVariant(user.name);
              const initials = getInitials(user.name);
              const isCopied = copiedId === user.id;

              return (
                <tr key={user.id}>
                  {/* Member info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <span className={`avatar ${avatarClass} !w-9 !h-9 !text-xs shadow-2xs`}>
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <div className="project-name truncate">{user.name}</div>
                        <span className="text-[11px] font-mono text-muted">
                          ID: {user.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Authorization role */}
                  <td>
                    <span className="inline-flex items-center rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
                      {user.role === "MANAGER" ? "Manager" : "Developer"}
                    </span>
                  </td>

                  {/* Position badge */}
                  <td>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-canvas border border-line text-ink">
                      <Briefcase className="w-3 h-3 text-muted shrink-0" />
                      <span className="truncate max-w-[200px]">{user.position}</span>
                    </div>
                  </td>

                  {/* Email & Copy */}
                  <td>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${user.email}`}
                        className="flex items-center gap-1.5 text-xs text-ink hover:text-purple transition-colors truncate max-w-[220px]"
                        title={`Send email to ${user.email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(user)}
                        className="p-1 rounded text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
                        title={isCopied ? "Email copied!" : "Copy email to clipboard"}
                        aria-label="Copy email"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatMemberDate(user.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn action-edit"
                        onClick={() => onEdit(user)}
                        title="Edit member"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="action-btn action-delete"
                        disabled={isDeleting}
                        onClick={() => onDelete(user)}
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
