"use client";

import { useMemo } from "react";
import {
  Pencil,
  Trash2,
  Mail,
  Calendar,
  Briefcase,
} from "lucide-react";
import type { UserResponse } from "@/lib/users/user.schema";
import { formatMemberDate } from "./user-utils";
import { Avatar } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";

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
  const columns = useMemo<Column<UserResponse>[]>(
    () => [
      {
        key: "member",
        header: "Team Member",
        render: (user) => (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="md" className="shadow-2xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#302e44]">
                {user.name}
              </div>
              <span className="font-mono text-[11px] text-muted">
                ID: {user.id.slice(0, 8)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Access Role",
        render: (user) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${user.role === "MANAGER"
              ? "border-purple-200 bg-purple-50 text-purple"
              : "border-teal-200 bg-teal-50 text-teal-700"
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${user.role === "MANAGER" ? "bg-purple" : "bg-teal-500"
                }`}
            />
            {user.role === "MANAGER" ? "Manager" : "Developer"}
          </span>
        ),
      },
      {
        key: "position",
        header: "Job Title",
        render: (user) => (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-indigo-900">
            <Briefcase className="h-3 w-3 shrink-0 text-indigo-500" />
            <span className="max-w-[200px] truncate">{user.position}</span>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email Address",
        render: (user) => (
          <a
            href={`mailto:${user.email}`}
            className="flex max-w-[220px] items-center gap-1.5 truncate text-xs text-ink transition-colors hover:text-blue-600"
            title={`Send email to ${user.email}`}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-sky-500" />
            <span className="truncate">{user.email}</span>
          </a>
        ),
      },
      {
        key: "joined",
        header: "Joined Date",
        render: (user) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>{formatMemberDate(user.createdAt)}</span>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey={(user) => user.id}
      actions={(user) => (
        <>
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            variant="edit"
            onClick={() => onEdit(user)}
            title="Edit member"
          />
          <ActionButton
            icon={<Trash2 className="h-3.5 w-3.5" />}
            variant="delete"
            disabled={isDeleting}
            onClick={() => onDelete(user)}
            title="Remove member"
          />
        </>
      )}
    />
  );
}