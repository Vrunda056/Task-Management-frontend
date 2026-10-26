"use client";

import React, { useState } from "react";
import type { Task, TaskItem } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { TaskItemRow } from "./task-item-row";
import { Plus, Trash2, CheckCircle2, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onOpenTimerModal: (task: Task, item: TaskItem) => void;
}

export function TaskCard({ task, onOpenTimerModal }: TaskCardProps) {
  const { deleteTask, addTaskItem } = useTaskContext();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemEst, setNewItemEst] = useState("30");

  const totalItems = task.items.length;
  const completedItems = task.items.filter((it) => it.status === "COMPLETED").length;
  const totalEst = task.items.reduce((acc, it) => acc + (it.estimatedTimeMin ?? 0), 0);
  const totalAct = task.items.reduce((acc, it) => acc + (it.actualEffortMin ?? 0), 0);

  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  function handleCreateItem(e: React.FormEvent) {
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
    <article className="rounded-xl border border-line bg-card shadow-2xs overflow-hidden hover:border-line transition-colors">
      {/* Distinct Structural Header Container */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-canvas/40 border-b border-line">
        <div className="grid gap-1">
          <div className="inline-flex items-center gap-1.5 text-muted text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-purple" />
            <span>{task.project?.name || "Project"}</span>
          </div>
          <h3 className="m-0 text-ink text-base font-semibold tracking-tight">{task.taskName}</h3>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3 text-muted text-xs font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-success" />
              {completedItems} of {totalItems} completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              {totalAct}m actual / {totalEst}m est
            </span>
          </div>

          <button
            type="button"
            className="grid place-items-center w-7.5 h-7.5 rounded-md border border-line bg-card text-muted hover:bg-danger-bg hover:text-danger hover:border-danger-border transition-colors cursor-pointer"
            onClick={() => {
              if (window.confirm(`Delete task "${task.taskName}" and all its items?`)) {
                deleteTask(task.id);
              }
            }}
            title="Delete entire task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Crisp Section Divider & Progress Indicator */}
      <div className="w-full h-1 bg-canvas border-b border-line">
        <div className="h-full bg-purple transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>

      {/* Task Line Items */}
      <div className="grid divide-y divide-line/60 p-2 sm:p-3 gap-2">
        {task.items.map((item) => (
          <TaskItemRow
            key={item.id}
            task={task}
            item={item}
            onOpenTimerModal={onOpenTimerModal}
          />
        ))}

        {task.items.length === 0 && (
          <div className="py-6 text-center text-muted text-xs">
            <p className="m-0">No line items in this task yet.</p>
          </div>
        )}
      </div>

      {/* Inline Add Item Form or Button */}
      <div className="px-5 py-2.5 bg-canvas/30 border-t border-line">
        {isAddingItem ? (
          <form className="flex flex-wrap items-center gap-2" onSubmit={handleCreateItem}>
            <input
              type="text"
              className="modal-input flex-1 min-w-[200px]"
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
                className="modal-input w-[75px]!"
                placeholder="Est (min)"
                value={newItemEst}
                onChange={(e) => setNewItemEst(e.target.value)}
              />
              <span className="text-xs text-muted">min</span>
            </div>
            <button type="submit" className="btn btn-primary text-xs px-3 py-1.5 h-auto">
              Add
            </button>
            <button
              type="button"
              className="btn btn-secondary text-xs px-3 py-1.5 h-auto"
              onClick={() => setIsAddingItem(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 border-0 bg-transparent text-muted hover:text-purple text-xs font-semibold cursor-pointer py-1 px-1.5 rounded transition-colors"
            onClick={() => setIsAddingItem(true)}
          >
            <Plus size={14} />
            <span>Add line item</span>
          </button>
        )}
      </div>
    </article>
  );
}
