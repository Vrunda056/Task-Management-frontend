"use client";

import { useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import type { ProjectResponse } from "@/lib/projects/project.schema";

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
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  isDeleting,
}: ProjectsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="projects-table w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider actions-col">
                Actions
              </th>
            </tr>
          </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <div className="project-name">{project.name}</div>
              </td>
              <td>
                <div className="project-description-cell">
                  <div className="project-description">
                    {project.description || (
                      <span className="no-description">No description</span>
                    )}
                  </div>
                  {project.description &&
                    project.description.length > DESCRIPTION_ICON_THRESHOLD && (
                      <DescriptionPreview description={project.description} />
                    )}
                </div>
              </td>
              <td>
                <div className="project-owner">
                  {project.createdBy ? (
                    <>
                      <span className="owner-avatar">
                        {project.createdBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="owner-info">
                        <div className="owner-name">
                          {project.createdBy.name}
                        </div>
                        <div className="owner-position">
                          {project.createdBy.position}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="no-owner">No owner</span>
                  )}
                </div>
              </td>
              <td>
                <div className="project-date">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="action-btn action-edit"
                    onClick={() => onEdit(project)}
                    title="Edit project"
                    type="button"
                  >
                    <Pencil className="w-4 h-4 text-black-500" />
                    Edit
                  </button>
                  <button
                    className="action-btn action-delete"
                    disabled={isDeleting}
                    onClick={() => onDelete(project)}
                    title="Delete project"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
