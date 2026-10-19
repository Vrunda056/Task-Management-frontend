"use client";

import { useState, type FormEvent } from "react";
import {
  createProjectSchema,
  updateProjectSchema,
  type ProjectResponse,
} from "@/lib/projects/project.schema";
import {
  useCreateProject,
  useUpdateProject,
} from "@/lib/projects/use-project";
import { useUsers } from "@/lib/users/use-user";

interface ProjectFormModalProps {
  project?: ProjectResponse;
  onClose: () => void;
}

export function ProjectFormModal({ project, onClose }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [createdById, setCreatedById] = useState(project?.createdById ?? "");
  const [validationError, setValidationError] = useState("");

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const users = useUsers();
  const mutation = project ? updateMutation : createMutation;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (project) {
      const result = updateProjectSchema.safeParse({
        name: name || undefined,
        description: description || undefined,
      });
      if (!result.success) {
        setValidationError(
          result.error.issues[0]?.message ?? "Please check the form fields."
        );
        return;
      }
      updateMutation.mutate(
        { id: project.id, input: result.data },
        { onSuccess: onClose }
      );
      return;
    }

    const result = createProjectSchema.safeParse({
      name,
      description: description || undefined,
      createdById,
    });
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Please check the form fields."
      );
      return;
    }
    createMutation.mutate(result.data, { onSuccess: onClose });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? "Edit Project" : "Create New Project"}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <label className="modal-field">
              <span className="modal-label">
                Project Name <span className="required">*</span>
              </span>
              <input
                autoFocus
                className="modal-input"
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
                type="text"
                value={name}
              />
            </label>

            {!project && (
              <label className="modal-field">
                <span className="modal-label">
                  Project Owner <span className="required">*</span>
                </span>
                <select
                  className="modal-input"
                  disabled={users.isPending}
                  onChange={(e) => setCreatedById(e.target.value)}
                  required
                  value={createdById}
                >
                  <option value="">Select owner</option>
                  {users.data?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="modal-field modal-field-full">
              <span className="modal-label">
                Description <span className="optional">(Optional)</span>
              </span>
              <textarea
                className="modal-input modal-textarea"
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
                value={description}
              />
            </label>
          </div>

          {(validationError || mutation.error) && (
            <div className="modal-error">
              {validationError || mutation.error?.message}
            </div>
          )}

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending
                ? project
                  ? "Saving..."
                  : "Creating..."
                : project
                  ? "Save Changes"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
