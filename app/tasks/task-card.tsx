"use client";

import { useState, type FormEvent } from "react";
import type { Task, TaskItem } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { TaskItemRow } from "./task-item-row";
import { Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { ConfirmDialog, Button } from "@/components/ui";

interface TaskCardProps {
  task: Task;
  onOpenTimerModal: (task: Task, item: TaskItem) => void;
}

export function TaskCard({ task, onOpenTimerModal }: TaskCardProps) {
  const { deleteTask, addTaskItem } = useTaskContext();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemEst, setNewItemEst] = useState("30");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const items = Array.isArray(task.items) ? task.items : [];
  const totalItems = items.length;
  const completedItems = items.filter((it) => it.status === "COMPLETED").length;
  const totalEst = items.reduce((acc, it) => acc + (it.estimatedTimeMin ?? 0), 0);
  const totalAct = items.reduce((acc, it) => acc + (it.actualEffortMin ?? 0), 0);

  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  function handleCreateItem(e: FormEvent) {
    e.preventDefault();
    if (!newItemDesc.trim()) return;

    addTaskItem(task.id, {
      description: newItemDesc.trim(),
      estimatedTimeMin: newItemEst ? parseInt(newItemEst) || null : null,
    });

    setNewItemDesc("");
    setNewItemEst("30");
    setIsAddingItem(false);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-purple-200/80 bg-white shadow-xs transition-all hover:border-purple-300 hover:shadow-sm">
      {/* Distinct Structural Header Container */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 bg-white px-5 py-4">
        <div className="grid gap-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple">
            <span className="h-1.5 w-1.5 rounded-full bg-purple" />
            <span>{task.project?.name || "Project"}</span>
          </div>
          <h3 className="m-0 text-base font-semibold tracking-tight text-ink">{task.taskName}</h3>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-success" />
              {completedItems} of {totalItems} completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-purple/60" />
              {totalAct}m actual / {totalEst}m est
            </span>
          </div>

          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-rose-200/80 bg-rose-50/60 text-rose-600 transition-all hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 shadow-2xs"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete entire task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Crisp Section Divider & Progress Indicator */}
      <div className="h-1 w-full bg-purple-50/80 overflow-hidden">
        <div className="h-full bg-purple transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>

      {/* Task Line Items */}
      <div className="grid gap-2 divide-y divide-purple-100/60 bg-white p-2 sm:p-3">
        {items.map((item) => (
          <TaskItemRow
            key={item.id}
            task={task}
            item={item}
            onOpenTimerModal={onOpenTimerModal}
          />
        ))}

        {items.length === 0 && (
          <div className="py-6 text-center text-xs text-muted">
            <p className="m-0">No line items in this task yet.</p>
          </div>
        )}
      </div>

      {/* Inline Add Item Form or Button */}
      <div className="border-t border-purple-100/80 bg-white px-5 py-3">
        {isAddingItem ? (
          <form className="flex flex-wrap items-center gap-2" onSubmit={handleCreateItem}>
            <input
              type="text"
              className="h-8 min-w-[200px] flex-1 rounded-lg border border-purple-200/80 bg-white px-3 text-xs text-ink outline-none transition-all focus:border-purple focus:ring-2 focus:ring-purple/15"
              placeholder="Describe line item / deliverable..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              autoFocus
              required
            />
            <div className="inline-flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="720"
                className="h-8 w-[75px] rounded-lg border border-purple-200/80 bg-white px-2.5 text-xs text-ink outline-none transition-all focus:border-purple focus:ring-2 focus:ring-purple/15"
                placeholder="Est (min)"
                value={newItemEst}
                onChange={(e) => setNewItemEst(e.target.value)}
              />
              <span className="text-xs text-muted">min</span>
            </div>
            <Button variant="primary" size="sm" type="submit">
              Add
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsAddingItem(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-purple-200 bg-purple-50/40 px-3 py-1.5 text-xs font-semibold text-purple transition-all hover:border-purple-400 hover:bg-purple-100/60 shadow-2xs"
            onClick={() => setIsAddingItem(true)}
          >
            <Plus size={14} className="text-purple" />
            <span>Add line item</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Task"
        description={`Delete task "${task.taskName}" and all its items? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          deleteTask(task.id);
          setShowDeleteConfirm(false);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
}
