"use client";

import { useState, type FormEvent } from "react";
import { useTaskContext } from "@/lib/tasks/task-context";
import { useProjects } from "@/lib/projects/use-project";
import { createTaskSchema, type CreateTaskInput } from "@/lib/tasks/task.schema";
import { Plus, Trash2, Clock } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui";

interface TaskFormModalProps {
  onClose: () => void;
}

export function TaskFormModal({ onClose }: TaskFormModalProps) {
  const { showToast } = useToast();
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
    value: string,
  ) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError("");

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
        result.error.issues[0]?.message ?? "Please check all fields.",
      );
      return;
    }

    createTask(result.data);
    showToast(`Task "${result.data.taskName}" created successfully`, "success");
    onClose();
  }

  return (
    <Modal
      onClose={onClose}
      size="lg"
      title="Create Daily Task"
      subtitle="Add a new task with line items and estimated completion times"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
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

          <div className="mt-5 border-t border-line/80 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[var(--text-sm)] font-semibold text-ink">
                  Task Line Items &amp; Estimates
                </h4>
                <p className="mt-0.5 text-[var(--text-xs)] text-muted">
                  Define individual deliverables and estimated duration
                </p>
              </div>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-border bg-purple-subtle px-3 py-1.5 text-xs font-semibold text-purple transition-colors hover:border-purple hover:bg-purple hover:text-white"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl border border-line bg-canvas/40 p-2.5 transition-all"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-purple-border bg-purple-subtle text-[11px] font-mono font-bold text-purple">
                    {index + 1}
                  </div>
                  <div className="flex flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
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
                    <div className="relative flex shrink-0 items-center sm:w-36">
                      <Clock size={14} className="pointer-events-none absolute left-3 text-muted" />
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
                      <span className="pointer-events-none absolute right-3 text-[11px] font-medium text-muted">
                        min
                      </span>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-danger-bg hover:text-danger"
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
            <div className="modal-error mt-4">{validationError}</div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Task & Items
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
