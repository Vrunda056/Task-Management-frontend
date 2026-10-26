"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X, User, Mail, Briefcase, Sparkles, AlertCircle } from "lucide-react";
import {
  createUserSchema,
  updateUserSchema,
  type UserResponse,
} from "@/lib/users/user.schema";
import { useCreateUser, useUpdateUser } from "@/lib/users/use-user";

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
  const isEditing = Boolean(user);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [position, setPosition] = useState(user?.position ?? "");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    position?: string;
    general?: string;
  }>({});

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const mutation = isEditing ? updateMutation : createMutation;

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    };

    if (isEditing && user) {
      const result = updateUserSchema.safeParse(formData);
      if (!result.success) {
        const errors: typeof fieldErrors = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0] as "name" | "email" | "position";
          if (path && !errors[path]) {
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
            setFieldErrors({ general: err.message || "Failed to update member." });
          },
        }
      );
      return;
    }

    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as "name" | "email" | "position";
        if (path && !errors[path]) {
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
        setFieldErrors({ general: err.message || "Failed to create member." });
      },
    });
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div
        className="modal-container max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="user-modal-title">
              {isEditing ? "Edit Team Member" : "Add New Team Member"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {isEditing
                ? "Update member profile, role, or contact details."
                : "Add a new member to assign tasks and collaborate on projects."}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form className="modal-body space-y-5" onSubmit={handleSubmit}>
          {/* General Error Banner */}
          {(fieldErrors.general || mutation.error) && (
            <div className="modal-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{fieldErrors.general || mutation.error?.message}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-name-input"
              className="modal-label flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-muted" />
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
              <p className="text-xs text-danger font-medium">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-email-input"
              className="modal-label flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-muted" />
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
              <p className="text-xs text-danger font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Position / Role */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-position-input"
              className="modal-label flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-muted" />
              <span>Role / Position</span>
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
              <p className="text-xs text-danger font-medium">{fieldErrors.position}</p>
            )}

            {/* Quick Suggested Roles */}
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-purple" />
                <span>Quick Role Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_ROLES.map((role) => {
                  const isSelected = position.toLowerCase() === role.toLowerCase();
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRolePick(role)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple text-white border-purple font-medium shadow-xs"
                          : "bg-canvas border-line text-ink hover:border-purple hover:bg-purple-50 hover:text-purple"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer pt-3 border-t border-line">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              type="button"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending
                ? isEditing
                  ? "Saving Changes..."
                  : "Creating Member..."
                : isEditing
                ? "Save Changes"
                : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
