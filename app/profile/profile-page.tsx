"use client";

import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  ExternalLink,
  FileSpreadsheet,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { ProfileModal } from "@/components/profile/profile-modal";
import { PageHeader } from "@/components/ui/page-header";
import { useMyProfile } from "@/lib/users/use-user";

export function ProfilePage() {
  const { data: user, isLoading, isError, error } = useMyProfile();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load your profile"
        message={error instanceof Error ? error.message : "Please try again."}
      />
    );
  }

  if (!user) {
    return (
      <ErrorState
        title="Profile unavailable"
        message="Your profile could not be found. Please try again."
      />
    );
  }

  const sheetUrl = user.sheetUrl ?? null;
  const roleLabel = user.role === "MANAGER" ? "Manager" : "Developer";

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="View your account details and profile settings."
        actions={
          <Button
            icon={<Pencil size={15} />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit profile
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-2xs">
        {/* Profile header */}
        <div className="flex flex-col gap-5 border-b border-line bg-purple-100 p-6 sm:flex-row sm:items-center sm:p-8">
          <Avatar
            name={user.name}
            size="lg"
            className="!h-16 !w-16 !text-lg"
          />

          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-bold text-ink">
              {user.name}
            </h2>

            <p className="mb-0 mt-1 text-sm text-muted">
              {user.position || "No job title added"}
            </p>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {/* Personal information - 3 cards per row */}
          <section aria-labelledby="profile-personal-heading">
            <h3
              id="profile-personal-heading"
              className="mb-4 mt-0 text-sm font-semibold text-ink"
            >
              Personal information
            </h3>

            <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Row 1 */}
              <div className="min-w-0 rounded-lg border border-line bg-white p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <UserRound size={14} />
                  Full name
                </dt>
                <dd className="mb-0 mt-2 break-words text-sm font-semibold text-ink">
                  {user.name}
                </dd>
              </div>

              <div className="min-w-0 rounded-lg border border-line bg-white p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Mail size={14} />
                  Work email
                  <Lock
                    aria-label="Email is managed by your organization"
                    size={12}
                    className="ml-auto shrink-0 text-muted"
                  />
                </dt>
                <dd className="mb-0 mt-2 break-all text-sm font-semibold text-ink">
                  {user.email}
                </dd>
              </div>

              <div className="min-w-0 rounded-lg border border-line bg-white p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Briefcase size={14} />
                  Job title
                </dt>
                <dd className="mb-0 mt-2 break-words text-sm font-semibold text-ink">
                  {user.position || "Not set"}
                </dd>
              </div>

              {/* Row 2 */}
              <div className="min-w-0 rounded-lg border border-line bg-white p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <ShieldCheck size={14} />
                  Workspace role
                </dt>
                <dd className="mb-0 mt-2 text-sm font-semibold text-ink">
                  {roleLabel}
                </dd>
              </div>

              <div className="min-w-0 rounded-lg border border-line bg-canvas-subtle p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <CalendarDays size={14} />
                  Member since
                </dt>
                <dd className="mb-0 mt-2 text-sm font-medium text-ink">
                  {formatDate(user.createdAt)}
                </dd>
              </div>

              <div className="min-w-0 rounded-lg border border-line bg-canvas-subtle p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <CalendarDays size={14} />
                  Last profile update
                </dt>
                <dd className="mb-0 mt-2 text-sm font-medium text-ink">
                  {formatDate(user.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Google Sheet connection - 3 rows */}
          <section aria-labelledby="profile-workspace-heading">
            <h3
              id="profile-workspace-heading"
              className="mb-4 mt-0 text-sm font-semibold text-ink"
            >
              Workspace connection
            </h3>

            <div className="flex flex-col gap-4 rounded-lg border border-line bg-canvas-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              {/* Sheet information */}
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success">
                  <FileSpreadsheet size={17} />
                </span>

                <div className="min-w-0">
                  <p className="m-0 text-sm font-semibold text-ink">
                    Google Sheet
                  </p>

                  {sheetUrl ? (
                    <p className="mb-0 mt-2 break-all text-xs leading-relaxed text-muted">
                      {sheetUrl}
                    </p>
                  ) : (
                    <p className="mb-0 mt-1 text-xs text-muted">
                      No sheet connected yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Open link at right */}
              {sheetUrl && (
                <a
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-purple hover:underline sm:ml-6"
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open connected sheet
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </section>
        </div>
      </section>

      <ProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}