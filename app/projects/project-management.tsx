"use client";

import { useState } from "react";
import type { ProjectResponse } from "@/lib/projects/project.schema";
import {
  useDeleteProject,
  useProjects,
} from "@/lib/projects/use-project";
import { useAuth } from "@/lib/auth/auth-context";
import { ProjectFormModal } from "./project-form-modal";
import { ProjectsTable } from "./projects-table";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Toast,
  useToast,
} from "@/components/ui";

export function ProjectManagement() {
  const { user } = useAuth();
  const canManageProjects = user?.role === "MANAGER";
  const projects = useProjects();
  const deleteMutation = useDeleteProject();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectResponse | null>(null);

  const { toast, showToast } = useToast();

  function handleCreate() {
    setEditingProject(null);
    setShowModal(true);
  }

  function handleEdit(project: ProjectResponse) {
    setEditingProject(project);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingProject(null);
  }

  function handleConfirmDelete() {
    if (!deletingProject) return;
    deleteMutation.mutate(deletingProject.id, {
      onSuccess: () => {
        showToast("Project deleted successfully");
        setDeletingProject(null);
      },
      onError: (err) => {
        showToast(err.message || "Failed to delete project", "error");
      },
    });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1360px]">
        <PageHeader
          title="Projects"
          subtitle={
            canManageProjects
              ? "Manage and track all your active projects"
              : "View projects available in your workspace"
          }
          actions={
            canManageProjects && (
              <Button icon={<span className="text-base font-normal">+</span>} onClick={handleCreate}>
                New Project
              </Button>
            )
          }
        />

        {projects.isPending && <LoadingState message="Loading projects..." />}

        {projects.isError && (
          <ErrorState
            title="Failed to load projects"
            message={projects.error.message}
          />
        )}

        {projects.data?.length === 0 && (
          <EmptyState
            icon="📋"
            title="No projects yet"
            message={
              canManageProjects
                ? "Create your first project to get started"
                : "There are no projects to display yet"
            }
            action={
              canManageProjects && (
                <Button icon={<span className="text-base font-normal">+</span>} onClick={handleCreate}>
                  Create Project
                </Button>
              )
            }
          />
        )}

        {projects.data && projects.data.length > 0 && (
          <ProjectsTable
            projects={projects.data}
            onEdit={handleEdit}
            onDelete={setDeletingProject}
            isDeleting={deleteMutation.isPending}
            canManage={canManageProjects}
          />
        )}
      </div>

      {showModal && (
        <ProjectFormModal
          onClose={handleCloseModal}
          project={editingProject || undefined}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingProject)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingProject(null)}
      />

      <Toast toast={toast} />
    </>
  );
}
