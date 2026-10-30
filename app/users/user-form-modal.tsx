"use client";

import { useState, type FormEvent } from "react";
import { User, Mail, Briefcase, Sparkles, AlertCircle } from "lucide-react";
import {
  createUserSchema,
  updateUserSchema,
  type UserRole,
  type UserResponse,
} from "@/lib/users/user.schema";
import { useCreateUser, useUpdateUser } from "@/lib/users/use-user";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui";

const SUGGESTED_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "DevOps Engineer",
  "QA Specialist",
  "Engineering Lead",
];

interface UserFormModalProps {
  user?: UserResponse | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const { showToast } = useToast();
  const isEditing = Boolean(user);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  const [accessRole, setAccessRole] = useState<UserRole>(
    user?.role ?? "DEVELOPER",
  );

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    position?: string;
    role?: string;
    general?: string;
  }>({});

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const mutation = isEditing ? updateMutation : createMutation;

  function handleRolePick(role: string) {
    setPosition(role);
    if (fieldErrors.position) {
      setFieldErrors((prev) => ({ ...prev, position: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = {
      name: name.trim(),
      email: email.trim(),
      position: position.trim(),
      ...(isEditing ? { role: accessRole } : {}),
    };

    if (isEditing && user) {
      const result = updateUserSchema.safeParse(formData);
      if (!result.success) {
        const errors: typeof fieldErrors = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0];
          if (
            (path === "name" ||
              path === "email" ||
              path === "position" ||
              path === "role") &&
            !errors[path]
          ) {
            errors[path] = issue.message;
          } else if (!errors.general) {
            errors.general = issue.message;
          }
        }
        setFieldErrors(errors);
        return;
      }

      updateMutation.mutate(
        { id: user.id, input: result.data },
        {
          onSuccess: () => {
            onSuccess?.(`Member "${name}" updated successfully.`);
            onClose();
          },
          onError: (err) => {
            const message = err.message || "Failed to update member.";
            setFieldErrors({ general: message });
            showToast(message, "error");
          },
        }
      );
      return;
    }

    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (
          (path === "name" || path === "email" || path === "position") &&
          !errors[path]
        ) {
          errors[path] = issue.message;
        } else if (!errors.general) {
          errors.general = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    createMutation.mutate(result.data, {
      onSuccess: () => {
        onSuccess?.(`Member "${name}" created successfully.`);
        onClose();
      },
      onError: (err) => {
        const message = err.message || "Failed to create member.";
        setFieldErrors({ general: message });
        showToast(message, "error");
      },
    });
  }

  return (
    <Modal
      onClose={onClose}
      maxWidth="max-w-xl"
      title={isEditing ? "Edit Team Member" : "Add New Team Member"}
      subtitle={
        isEditing
          ? "Update member profile, role, or contact details."
          : "Add a new member to assign tasks and collaborate on projects."
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-6">
          {/* General Error Banner */}
          {(fieldErrors.general || mutation.error) && (
            <div className="modal-error flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
              <span>{fieldErrors.general || mutation.error?.message}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-name-input"
              className="modal-label flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5 text-muted" />
              <span>Full Name</span>
              <span className="required">*</span>
            </label>
            <input
              id="user-name-input"
              autoComplete="name"
              autoFocus
              className={`modal-input ${
                fieldErrors.name ? "!border-danger focus:!border-danger" : ""
              }`}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="e.g. Alex Morgan"
              required
              type="text"
              value={name}
            />
            {fieldErrors.name && (
              <p className="text-xs font-medium text-danger">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-email-input"
              className="modal-label flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-muted" />
              <span>Work Email Address</span>
              <span className="required">*</span>
            </label>
            <input
              id="user-email-input"
              autoComplete="email"
              className={`modal-input ${
                fieldErrors.email ? "!border-danger focus:!border-danger" : ""
              }`}
              maxLength={254}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="e.g. alex.morgan@studio.app"
              required
              type="email"
              value={email}
            />
            {fieldErrors.email && (
              <p className="text-xs font-medium text-danger">{fieldErrors.email}</p>
            )}
          </div>

          {/* Job Position */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-position-input"
              className="modal-label flex items-center gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5 text-muted" />
              <span>Job Title / Position</span>
              <span className="required">*</span>
            </label>
            <input
              id="user-position-input"
              className={`modal-input ${
                fieldErrors.position ? "!border-danger focus:!border-danger" : ""
              }`}
              maxLength={100}
              onChange={(e) => {
                setPosition(e.target.value);
                if (fieldErrors.position) {
                  setFieldErrors((prev) => ({ ...prev, position: undefined }));
                }
              }}
              placeholder="e.g. Senior Frontend Engineer"
              required
              type="text"
              value={position}
            />
            {fieldErrors.position && (
              <p className="text-xs font-medium text-danger">{fieldErrors.position}</p>
            )}

            {/* Quick Suggested Roles */}
            <div className="pt-1">
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                <Sparkles className="h-3 w-3 text-purple" />
                <span>Suggested Job Titles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_ROLES.map((role) => {
                  const isSelected = position.toLowerCase() === role.toLowerCase();
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRolePick(role)}
                      className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-all ${
                        isSelected
                          ? "border-purple bg-purple font-medium text-white shadow-xs"
                          : "border-line bg-canvas text-ink hover:border-purple hover:bg-purple-50 hover:text-purple"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <label htmlFor="user-access-role" className="modal-label">
                Access Role
              </label>
              <select
                id="user-access-role"
                className={`modal-input ${
                  fieldErrors.role ? "!border-danger focus:!border-danger" : ""
                }`}
                onChange={(event) => {
                  setAccessRole(event.target.value as UserRole);
                  if (fieldErrors.role) {
                    setFieldErrors((previous) => ({
                      ...previous,
                      role: undefined,
                    }));
                  }
                }}
                value={accessRole}
              >
                <option value="DEVELOPER">Developer</option>
                <option value="MANAGER">Manager</option>
              </select>
              <p className="text-xs text-muted">
                Managers can manage users and projects. Developers can view
                projects only.
              </p>
              {fieldErrors.role && (
                <p className="text-xs font-medium text-danger">
                  {fieldErrors.role}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 border-t border-line px-6 py-5">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={mutation.isPending}
          >
            {mutation.isPending
              ? isEditing
                ? "Saving Changes..."
                : "Creating Member..."
              : isEditing
                ? "Save Changes"
                : "Create Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
