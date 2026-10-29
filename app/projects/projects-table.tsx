"use client";

import { useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import type { ProjectResponse } from "@/lib/projects/project.schema";
import { Avatar } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatMemberDate } from "../users/user-utils";

const DESCRIPTION_ICON_THRESHOLD = 100;

function DescriptionPreview({ description }: { description: string }) {
  const [preview, setPreview] = useState<{
    left: number;
    top: number;
    placement: "above" | "below";
  } | null>(null);
  const tooltipId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showPreview(element: HTMLButtonElement) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = element.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      window.innerWidth - width - 12,
    );
    const placement = rect.bottom + 250 > window.innerHeight ? "above" : "below";

    setPreview({
      left,
      top: placement === "below" ? rect.bottom + 10 : rect.top - 10,
      placement,
    });
  }

  function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) {
    showPreview(event.currentTarget);
  }

  function handleFocus(event: FocusEvent<HTMLButtonElement>) {
    showPreview(event.currentTarget);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPreview(null), 120);
  }

  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <>
      <button
        aria-describedby={preview ? tooltipId : undefined}
        aria-label="Show full description"
        className="description-info"
        onBlur={scheduleClose}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={scheduleClose}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 7.2v3.4M8 5.1h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      </button>
      {preview && typeof document !== "undefined" && createPortal(
        <div
          className={`description-preview description-preview-${preview.placement}`}
          id={tooltipId}
          onMouseEnter={keepOpen}
          onMouseLeave={scheduleClose}
          role="tooltip"
          style={{ left: preview.left, top: preview.top }}
        >
          {description}
        </div>,
        document.body,
      )}
    </>
  );
}

interface ProjectsTableProps {
  projects: ProjectResponse[];
  onEdit: (project: ProjectResponse) => void;
  onDelete: (project: ProjectResponse) => void;
  isDeleting: boolean;
  canManage: boolean;
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  isDeleting,
  canManage,
}: ProjectsTableProps) {
  const columns: Column<ProjectResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (project) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span>{project.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (project) => (
        <div className="flex max-w-[430px] items-center gap-2">
          <div className="project-description text-ink-secondary">
            {project.description || (
              <span className="no-description">No description</span>
            )}
          </div>
          {project.description &&
            project.description.length > DESCRIPTION_ICON_THRESHOLD && (
              <DescriptionPreview description={project.description} />
            )}
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (project) => (
        <div className="flex items-center gap-2.5">
          {project.createdBy ? (
            <>
              <Avatar
                name={project.createdBy.name}
                size="md"
                className="!h-8 !w-8 !bg-[#f1efff] !text-purple shadow-2xs"
              />
              <div className="grid min-w-0 gap-0.5">
                <div className="text-sm font-medium text-ink">
                  {project.createdBy.name}
                </div>
                <div className="text-xs text-muted">
                  {project.createdBy.position}
                </div>
              </div>
            </>
          ) : (
            <span className="text-xs italic text-muted">No owner</span>
          )}
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (project) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>{formatMemberDate(project.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={projects}
      rowKey={(project) => project.id}
      actions={
        canManage
          ? (project) => (
            <>
              <ActionButton
                icon={<Pencil className="h-4 w-4" />}
                variant="edit"
                onClick={() => onEdit(project)}
                title="Edit project"
              />
              <ActionButton
                icon={<Trash2 className="h-4 w-4" />}
                variant="delete"
                disabled={isDeleting}
                onClick={() => onDelete(project)}
                title="Delete project"
              />
            </>
          )
          : undefined
      }
    />
  );
}
