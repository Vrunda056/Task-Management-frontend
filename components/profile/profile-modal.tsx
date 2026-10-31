"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Briefcase,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUpdateMyProfile } from "@/lib/users/use-user";
import { updateProfileSchema } from "@/lib/users/user.schema";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui";

const SUGGESTED_POSITIONS = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "DevOps Engineer",
  "QA Specialist",
];

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const updateProfileMutation = useUpdateMyProfile();

  const isProfileIncomplete = !user?.sheetUrl;

  const [name, setName] = useState(user?.name ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  const [sheetUrl, setSheetUrl] = useState(user?.sheetUrl ?? "");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    position?: string;
    sheetUrl?: string;
    general?: string;
  }>({});

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const trimmedUrl = sheetUrl.trim();
    const payload = {
      name: name.trim(),
      position: position.trim(),
      sheetUrl: trimmedUrl.length > 0 ? trimmedUrl : null,
    };

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as keyof typeof errors;
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      showToast(
        isProfileIncomplete
          ? "Profile completed successfully!"
          : "Profile updated successfully!",
        "success",
      );
      onClose();
    } catch (err) {
      setFieldErrors({
        general:
          err instanceof Error
            ? err.message
            : "Failed to update profile. Please try again.",
      });
    }
  }

  const isValidUrlPreview = (() => {
    if (!sheetUrl.trim()) return false;
    try {
      const parsed = new URL(sheetUrl.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  })();

  return (
    <Modal
      onClose={onClose}
      title={isProfileIncomplete ? "Complete your profile" : "My profile"}
      subtitle={
        isProfileIncomplete
          ? "Add your details and connect a Google Sheet to finish setup."
          : "Update your personal details and Google Sheet connection."
      }
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-5">
          {isProfileIncomplete && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle size={17} />
              </span>
              <div className="space-y-1">
                <p className="font-semibold">One last step</p>
                <p className="text-xs leading-relaxed text-amber-900">
                  Connect your Google Sheet to sync your logged tasks and reports.
                </p>
              </div>
            </div>
          )}

          {fieldErrors.general && (
            <div className="modal-error mt-0" role="alert">
              {fieldErrors.general}
            </div>
          )}

          <section
            aria-label="Account details"
            className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-canvas-subtle p-4 sm:grid-cols-2"
          >
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Mail size={14} /> Work email
              </span>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink">
                <span className="truncate">{user?.email}</span>
                <span title="Email is managed by your organization">
                  <Lock size={13} className="shrink-0 text-muted" />
                </span>
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <ShieldCheck size={14} /> Access role
              </span>
              <span className="mt-1 inline-flex rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink">
                {user?.role === "MANAGER" ? "Manager" : "Developer"}
              </span>
            </div>
          </section>

          <div className="space-y-1.5">
            <label htmlFor="profile-name-input" className="modal-label flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted" />
              <span>Full Name</span>
              <span className="required">*</span>
            </label>
            <input
              id="profile-name-input"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "profile-name-error" : undefined}
              className={`modal-input ${
                fieldErrors.name ? "!border-danger focus:!border-danger" : ""
              }`}
              maxLength={100}
              placeholder="e.g. Alex Morgan"
              required
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {fieldErrors.name && (
              <p id="profile-name-error" className="text-xs font-medium text-danger">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-position-input" className="modal-label flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-muted" />
              <span>Job title</span>
              <span className="required">*</span>
            </label>
            <input
              id="profile-position-input"
              aria-invalid={Boolean(fieldErrors.position)}
              aria-describedby={fieldErrors.position ? "profile-position-error" : "profile-position-help"}
              className={`modal-input ${
                fieldErrors.position ? "!border-danger focus:!border-danger" : ""
              }`}
              maxLength={100}
              placeholder="e.g. Senior Frontend Developer"
              required
              type="text"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                if (fieldErrors.position) setFieldErrors((prev) => ({ ...prev, position: undefined }));
              }}
            />
            {fieldErrors.position && (
              <p id="profile-position-error" className="text-xs font-medium text-danger">
                {fieldErrors.position}
              </p>
            )}

            <div id="profile-position-help" className="pt-1">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                Or choose a suggested title
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_POSITIONS.map((pos) => {
                  const isSelected = position.toLowerCase() === pos.toLowerCase();
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => {
                        setPosition(pos);
                        if (fieldErrors.position) {
                          setFieldErrors((prev) => ({ ...prev, position: undefined }));
                        }
                      }}
                      aria-pressed={isSelected}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "border-purple bg-purple-subtle font-semibold text-purple"
                          : "border-line bg-white text-ink-secondary hover:border-purple-border hover:bg-purple-subtle"
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="profile-sheet-input" className="modal-label flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-success" />
                <span>Sheet link</span>
                <span className="required">*</span>
              </label>
              {isValidUrlPreview && (
                <a
                  href={sheetUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Test Link <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              id="profile-sheet-input"
              aria-invalid={Boolean(fieldErrors.sheetUrl)}
              aria-describedby={fieldErrors.sheetUrl ? "profile-sheet-error" : "profile-sheet-help"}
              className={`modal-input ${
                fieldErrors.sheetUrl ? "!border-danger focus:!border-danger" : ""
              }`}
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
              type="url"
              value={sheetUrl}
              onChange={(e) => {
                setSheetUrl(e.target.value);
                if (fieldErrors.sheetUrl) {
                  setFieldErrors((prev) => ({ ...prev, sheetUrl: undefined }));
                }
              }}
            />
            {fieldErrors.sheetUrl ? (
              <p id="profile-sheet-error" className="text-xs font-medium text-danger">
                {fieldErrors.sheetUrl}
              </p>
            ) : (
              <p id="profile-sheet-help" className="flex items-start gap-1.5 text-xs leading-relaxed text-muted">
                <Info size={14} className="mt-0.5 shrink-0 text-subtle" />
                <span>
                  Paste the Google Sheets link where Taskly should record your daily work.
                </span>
              </p>
            )}
          </div>
        </ModalBody>

        {/* Pinned Footer */}
        <ModalFooter>
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={updateProfileMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending
              ? "Saving Profile..."
              : isProfileIncomplete
                ? "Complete Setup"
                : "Save Changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
