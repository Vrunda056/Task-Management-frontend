"use client";

import React, { useState } from "react";
import { useTaskContext } from "@/lib/tasks/task-context";
import { useProjects } from "@/lib/projects/use-project";
import { createTaskSchema, type CreateTaskInput } from "@/lib/tasks/task.schema";
import { Plus, Trash2, Clock } from "lucide-react";

interface TaskFormModalProps {
  onClose: () => void;
}

export function TaskFormModal({ onClose }: TaskFormModalProps) {
  const { createTask, selectedDate } = useTaskContext();
  const projectsQuery = useProjects();

  const [taskName, setTaskName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [items, setItems] = useState<
    Array<{ description: string; estimatedTimeMin: string; note: string }>
  >([
    { description: "", estimatedTimeMin: "30", note: "" },
  ]);

  const [validationError, setValidationError] = useState("");

  function handleAddItem() {
    setItems((prev) => [...prev, { description: "", estimatedTimeMin: "30", note: "" }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleItemChange(
    index: number,
    field: "description" | "estimatedTimeMin" | "note",
    value: string
  ) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    // Determine project ID
    let finalProjectId = projectId;
    if (!finalProjectId && projectsQuery.data && projectsQuery.data.length > 0) {
      finalProjectId = projectsQuery.data[0].id;
    } else if (!finalProjectId) {
      finalProjectId = "project-custom";
    }

    const payload: CreateTaskInput = {
      taskName: taskName.trim(),
      projectId: finalProjectId,
      date,
      items: items.map((it) => ({
        description: it.description.trim(),
        estimatedTimeMin: it.estimatedTimeMin ? parseInt(it.estimatedTimeMin) || 0 : null,
        note: it.note.trim() || null,
      })),
    };

    const result = createTaskSchema.safeParse(payload);
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Please check all fields."
      );
      return;
    }

    createTask(result.data);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create Daily Task</h2>
            <p className="modal-subtitle">
              Add a new task with line items and estimated completion times
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <label className="modal-field">
              <span className="modal-label">
                Task Name <span className="required">*</span>
              </span>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Core Analytics Changes, DEV server"
                required
                maxLength={100}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                autoFocus
              />
            </label>

            <label className="modal-field">
              <span className="modal-label">
                Project <span className="required">*</span>
              </span>
              <select
                className="modal-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">Select Project</option>
                {projectsQuery.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                {(!projectsQuery.data || projectsQuery.data.length === 0) && (
                  <>
                    <option value="project-1">Website redesign</option>
                    <option value="project-2">Internal Platform</option>
                    <option value="project-3">Mobile App</option>
                  </>
                )}
              </select>
            </label>

            <label className="modal-field">
              <span className="modal-label">
                Date <span className="required">*</span>
              </span>
              <input
                type="date"
                className="modal-input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
                  Task Line Items & Estimates
                </h4>
                <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5">
                  Define the individual deliverable descriptions and target minutes
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--purple)] hover:bg-[#ebe6fd] bg-[#f3f0ff] transition-colors border border-[#ded7fb]"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#faf9fc] border border-[#e8e6ef]"
                >
                  <div className="w-6 h-6 rounded-md bg-[#f0edff] text-[var(--purple)] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      className="modal-input flex-1 !text-sm"
                      placeholder="e.g. Refactor telemetry pipeline for events..."
                      required
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                    <div className="relative flex items-center shrink-0 sm:w-36">
                      <Clock size={14} className="absolute left-3 text-[#9a98aa] pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        max="720"
                        step="5"
                        className="modal-input pl-8 pr-10 !text-sm"
                        placeholder="Est (min)"
                        value={item.estimatedTimeMin}
                        onChange={(e) =>
                          handleItemChange(index, "estimatedTimeMin", e.target.value)
                        }
                      />
                      <span className="absolute right-3 text-[11px] text-[#9a98aa] font-medium pointer-events-none">
                        min
                      </span>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="p-2 text-[#9a98aa] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      onClick={() => handleRemoveItem(index)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {validationError && (
            <div className="modal-error">{validationError}</div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task & Items
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
