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
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui";

interface ProjectFormModalProps {
  project?: ProjectResponse;
  onClose: () => void;
}

export function ProjectFormModal({ project, onClose }: ProjectFormModalProps) {
  const { showToast } = useToast();
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
          result.error.issues[0]?.message ?? "Please check the form fields.",
        );
        return;
      }
      updateMutation.mutate(
        { id: project.id, input: result.data },
        {
          onSuccess: () => {
            showToast("Project updated successfully", "success");
            onClose();
          },
          onError: (err) => {
            showToast(err.message || "Failed to update project", "error");
          },
        },
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
        result.error.issues[0]?.message ?? "Please check the form fields.",
      );
      return;
    }
    createMutation.mutate(result.data, {
      onSuccess: () => {
        showToast(`Project "${name}" created successfully`, "success");
        onClose();
      },
      onError: (err) => {
        showToast(err.message || "Failed to create project", "error");
      },
    });
  }

  return (
    <Modal
      onClose={onClose}
      title={project ? "Edit Project" : "Create New Project"}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
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
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line px-6 py-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={mutation.isPending}>
            {mutation.isPending
              ? project
                ? "Saving..."
                : "Creating..."
              : project
                ? "Save Changes"
                : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
