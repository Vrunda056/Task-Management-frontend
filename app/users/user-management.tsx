"use client";

import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import type { UserResponse } from "@/lib/users/user.schema";
import { useDeleteUser, useUsers } from "@/lib/users/use-user";
import { UserFormModal } from "./user-form-modal";
import { UsersTable } from "./users-table";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterSelect,
  LoadingState,
  PageHeader,
  SearchInput,
  Toolbar,
  useToast,
} from "@/components/ui";
import { Avatar } from "@/components/ui/avatar";

export function UserManagement() {
  const usersQuery = useUsers();
  const deleteMutation = useDeleteUser();

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");

  // Toast
  const { showToast } = useToast();

  const allUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const uniquePositions = useMemo(() => {
    const positions = Array.from(
      new Set(allUsers.map((u) => u.position.trim())),
    ).filter(Boolean);
    return positions.sort((a, b) => a.localeCompare(b));
  }, [allUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.position.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q),
      );
    }

    if (selectedPosition !== "all") {
      result = result.filter(
        (user) =>
          user.position.trim().toLowerCase() === selectedPosition.toLowerCase(),
      );
    }

    return result;
  }, [allUsers, searchQuery, selectedPosition]);

  function handleOpenCreate() {
    setEditingUser(null);
    setShowFormModal(true);
  }

  function handleOpenEdit(user: UserResponse) {
    setEditingUser(user);
    setShowFormModal(true);
  }

  function handleCloseFormModal() {
    setShowFormModal(false);
    setEditingUser(null);
  }

  function handleCloseDeleteModal() {
    setDeletingUser(null);
  }

  function handleConfirmDelete(user: UserResponse) {
    deleteMutation.mutate(user.id, {
      onSuccess: () => {
        showToast(`Member "${user.name}" was removed.`);
        handleCloseDeleteModal();
      },
      onError: (err) => {
        showToast(
          err.message || "Failed to delete user. Please try again.",
          "error",
        );
      },
    });
  }

  function handleClearFilters() {
    setSearchQuery("");
    setSelectedPosition("all");
  }

  const hasActiveFilters = searchQuery.trim() !== "" || selectedPosition !== "all";

  return (
    <div className="mx-auto w-full max-w-[1360px] pb-12">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage team members, roles, and access across projects and workflows."
        actions={
          <Button icon={<span className="text-base font-normal">+</span>} onClick={handleOpenCreate}>
            New Member
          </Button>
        }
      />

      {/* Filter and Control Bar */}
      <Toolbar>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or role..."
          className="flex-1 min-w-[220px]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <FilterSelect
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              aria-label="Filter by job title"
            >
              <option value="all">All Positions ({allUsers.length})</option>
              {uniquePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </FilterSelect>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex h-9 shrink-0 whitespace-nowrap cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/90 px-3 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-300 hover:text-red-700 shadow-2xs"
            >
              <X className="h-3.5 w-3.5 text-red-500" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </Toolbar>

      {/* States: Loading / Error / Empty */}
      {usersQuery.isPending && <LoadingState message="Loading team members..." />}

      {usersQuery.isError && (
        <ErrorState
          title="Failed to load members"
          message={usersQuery.error.message}
        />
      )}

      {!usersQuery.isPending && !usersQuery.isError && allUsers.length === 0 && (
        <EmptyState
          icon="👥"
          title="No team members yet"
          message="Add your team members to assign tasks and track project workflows"
          action={
            <Button
              icon={<span className="text-base font-normal">+</span>}
              onClick={handleOpenCreate}
            >
              Add Member
            </Button>
          }
        />
      )}

      {/* Filtered Empty State */}
      {!usersQuery.isPending &&
        !usersQuery.isError &&
        allUsers.length > 0 &&
        filteredUsers.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No matching members found"
            message={`No members matched your search for "${searchQuery}"${
              selectedPosition !== "all" ? ` with position "${selectedPosition}"` : ""
            }.`}
            action={
              <Button variant="secondary" onClick={handleClearFilters}>
                Reset Filters
              </Button>
            }
          />
        )}

      {/* Data Render: Table / List View Only */}
      {!usersQuery.isPending &&
        !usersQuery.isError &&
        filteredUsers.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted">
              <span>
                Showing {filteredUsers.length} of {allUsers.length}{" "}
                {allUsers.length === 1 ? "member" : "members"}
              </span>
            </div>

            <UsersTable
              users={filteredUsers}
              onEdit={handleOpenEdit}
              onDelete={setDeletingUser}
              isDeleting={deleteMutation.isPending}
            />
          </>
        )}

      {/* Modals */}
      {showFormModal && (
        <UserFormModal
          user={editingUser}
          onClose={handleCloseFormModal}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingUser)}
        title="Remove Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        confirmLabel="Remove Member"
        loading={deleteMutation.isPending}
        onConfirm={() => deletingUser && handleConfirmDelete(deletingUser)}
        onClose={handleCloseDeleteModal}
        warning="Removing this user will unassign their active tasks and remove their workspace access."
      >
        {deletingUser && (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas p-3">
            <Avatar name={deletingUser.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {deletingUser.name}
              </p>
              <p className="truncate text-xs text-muted">
                {deletingUser.position} · {deletingUser.email}
              </p>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
