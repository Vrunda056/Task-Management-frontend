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

export function ProjectManagement() {
  const { user } = useAuth();
  const canManageProjects = user?.role === "MANAGER";
  const projects = useProjects();
  const deleteMutation = useDeleteProject();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(
    null
  );

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

  function handleDelete(project: ProjectResponse) {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(project.id);
    }
  }

  return (
    <>
      <div className="projects-page">
        <header className="projects-header">
          <div>
            <h1 className="projects-title">Projects</h1>
            <p className="projects-subtitle">
              {canManageProjects
                ? "Manage and track all your active projects"
                : "View projects available in your workspace"}
            </p>
          </div>
          {canManageProjects && (
            <button className="primary-button" onClick={handleCreate}>
              <span>+</span> New Project
            </button>
          )}
        </header>

        {projects.isPending && (
          <div className="page-state">
            <div className="loading-spinner" />
            <p>Loading projects...</p>
          </div>
        )}

        {projects.isError && (
          <div className="page-error">
            <span className="error-icon">⚠</span>
            <div>
              <h3>Failed to load projects</h3>
              <p>{projects.error.message}</p>
            </div>
          </div>
        )}

        {projects.data?.length === 0 && (
          <div className="page-empty">
            <div className="empty-icon">📋</div>
            <h3>No projects yet</h3>
            <p>
              {canManageProjects
                ? "Create your first project to get started"
                : "There are no projects to display yet"}
            </p>
            {canManageProjects && (
              <button className="primary-button" onClick={handleCreate}>
                <span>+</span> Create Project
              </button>
            )}
          </div>
        )}

        {projects.data && projects.data.length > 0 && (
          <ProjectsTable
            projects={projects.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            canManage={canManageProjects}
          />
        )}

        {deleteMutation.isError && (
          <div className="toast toast-error">
            Failed to delete: {deleteMutation.error.message}
          </div>
        )}
        {deleteMutation.isSuccess && (
          <div className="toast toast-success">
            Project deleted successfully
          </div>
        )}
      </div>

      {showModal && (
        <ProjectFormModal
          onClose={handleCloseModal}
          project={editingProject || undefined}
        />
      )}
    </>
  );
}
