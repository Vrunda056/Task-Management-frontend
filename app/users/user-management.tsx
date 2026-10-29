"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Briefcase,
  Sparkles,
  Search,
  X,
  LayoutGrid,
  List,
  Filter,
} from "lucide-react";
import type { UserResponse } from "@/lib/users/user.schema";
import { useDeleteUser, useUsers } from "@/lib/users/use-user";
import { UserFormModal } from "./user-form-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { UsersTable } from "./users-table";
import { UsersGrid } from "./users-grid";

export function UserManagement() {
  const usersQuery = useUsers();
  const deleteMutation = useDeleteUser();

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  // Filter & view states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Toast state
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  function triggerToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => {
      setToast((current) => (current?.text === text ? null : current));
    }, 3500);
  }

  const allUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  // Derived metrics
  const totalCount = allUsers.length;
  const uniquePositions = useMemo(() => {
    const positions = Array.from(new Set(allUsers.map((u) => u.position.trim()))).filter(
      Boolean
    );
    return positions.sort((a, b) => a.localeCompare(b));
  }, [allUsers]);

  const newestMember = useMemo(() => {
    if (allUsers.length === 0) return null;
    return [...allUsers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [allUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.position.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (selectedPosition !== "all") {
      result = result.filter(
        (user) =>
          user.position.trim().toLowerCase() === selectedPosition.toLowerCase()
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

  function handleOpenDelete(user: UserResponse) {
    setDeletingUser(user);
  }

  function handleCloseDeleteModal() {
    setDeletingUser(null);
  }

  function handleConfirmDelete(user: UserResponse) {
    deleteMutation.mutate(user.id, {
      onSuccess: () => {
        triggerToast(`Member "${user.name}" was removed.`);
        handleCloseDeleteModal();
      },
      onError: (err) => {
        triggerToast(
          err.message || "Failed to delete user. Please try again.",
          "error"
        );
      },
    });
  }

  function handleClearFilters() {
    setSearchQuery("");
    setSelectedPosition("all");
  }

  return (
    <div className="projects-page pb-12">
      {/* Top Header */}
      <header className="projects-header">
        <div>
          <h1 className="projects-title">User Management</h1>
          <p className="projects-subtitle">
            Manage team members, roles, and access across projects and workflows.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={handleOpenCreate}
          type="button"
        >
          <span>+</span> New Member
        </button>
      </header>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 p-3 rounded-xl border border-line bg-card shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="modal-input !h-9 !pl-9 !pr-8 text-xs"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns and View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Position Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              className="modal-input !h-9 !w-auto text-xs py-1"
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
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-line bg-canvas p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-purple shadow-2xs font-semibold"
                  : "text-muted hover:text-ink"
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-purple shadow-2xs font-semibold"
                  : "text-muted hover:text-ink"
              }`}
              title="Grid cards view"
              aria-label="Grid cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          {(searchQuery.trim() || selectedPosition !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {/* Loading state */}
      {usersQuery.isPending && (
        <div className="page-state">
          <div className="loading-spinner" />
          <p>Loading team members...</p>
        </div>
      )}

      {/* Error state */}
      {usersQuery.isError && (
        <div className="page-error">
          <span className="error-icon">⚠</span>
          <div>
            <h3>Failed to load members</h3>
            <p>{usersQuery.error.message}</p>
          </div>
        </div>
      )}

      {/* Empty State: No users in system */}
      {!usersQuery.isPending && !usersQuery.isError && allUsers.length === 0 && (
        <div className="page-empty">
          <div className="empty-icon">👥</div>
          <h3>No team members yet</h3>
          <p>Add your team members to assign tasks and track project workflows</p>
          <button
            className="primary-button"
            onClick={handleOpenCreate}
            type="button"
          >
            <span>+</span> Add Member
          </button>
        </div>
      )}

      {/* Filtered Empty State: Users exist but search/filter returned 0 results */}
      {!usersQuery.isPending &&
        !usersQuery.isError &&
        allUsers.length > 0 &&
        filteredUsers.length === 0 && (
          <div className="page-empty">
            <div className="empty-icon">🔍</div>
            <h3>No matching members found</h3>
            <p>
              No members matched your search for &ldquo;{searchQuery}&rdquo;
              {selectedPosition !== "all" &&
                ` with position "${selectedPosition}"`}.
            </p>
            <button
              className="btn btn-secondary cursor-pointer mt-2"
              onClick={handleClearFilters}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        )}

      {/* Data Render: Table or Grid View */}
      {!usersQuery.isPending &&
        !usersQuery.isError &&
        filteredUsers.length > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-muted mb-3 px-1">
              <span>
                Showing {filteredUsers.length} of {allUsers.length}{" "}
                {allUsers.length === 1 ? "member" : "members"}
              </span>
            </div>

            {viewMode === "table" ? (
              <UsersTable
                users={filteredUsers}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                isDeleting={deleteMutation.isPending}
              />
            ) : (
              <UsersGrid
                users={filteredUsers}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </>
        )}

      {/* Modals */}
      {showFormModal && (
        <UserFormModal
          user={editingUser}
          onClose={handleCloseFormModal}
          onSuccess={(msg) => triggerToast(msg, "success")}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          isDeleting={deleteMutation.isPending}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`toast ${
            toast.type === "error" ? "toast-error" : "toast-success"
          }`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
