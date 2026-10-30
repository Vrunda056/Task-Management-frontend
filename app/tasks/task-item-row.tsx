"use client";

import { useState } from "react";
import type { Task, TaskItem, TaskItemStatus } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import {
  Play,
  Pause,
  Timer,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Trash2,
} from "lucide-react";
import { ConfirmDialog, StatusBadge, useToast } from "@/components/ui";

interface TaskItemRowProps {
  task: Task;
  item: TaskItem;
  onOpenTimerModal: (task: Task, item: TaskItem) => void;
}

export function TaskItemRow({ task, item, onOpenTimerModal }: TaskItemRowProps) {
  const { showToast } = useToast();
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    updateTaskItem,
    deleteTaskItem,
  } = useTaskContext();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.note ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCurrentActiveTimer = activeTimer?.taskItemId === item.id;
  const isRunning = isCurrentActiveTimer && activeTimer.isRunning;

  // Status toggle cycling: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING
  function handleToggleStatus() {
    let nextStatus: TaskItemStatus = "IN_PROGRESS";
    if (item.status === "PENDING") nextStatus = "IN_PROGRESS";
    else if (item.status === "IN_PROGRESS") nextStatus = "COMPLETED";
    else nextStatus = "PENDING";

    updateTaskItem(item.id, { status: nextStatus });
    if (nextStatus === "COMPLETED") {
      showToast(`Completed "${item.description}"!`, "success");
    }
  }

  function handleQuickTimerClick() {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer(task, item, { mode: "stopwatch" });
    }
  }

  function handleSaveNote() {
    updateTaskItem(item.id, { note: noteText.trim() || null });
    setIsEditingNote(false);
  }

  const estimated = item.estimatedTimeMin ?? 0;
  const actual = item.actualEffortMin ?? 0;
  const hasBoth = estimated > 0 && actual > 0;
  const diff = actual - estimated;

  return (
    <div
      className={`flex items-center justify-between gap-4 p-3.5 transition-colors sm:px-5 ${
        item.status === "COMPLETED" ? "bg-slate-50/60" : "hover:bg-slate-50/60"
      } ${isRunning ? "border-l-[3px] border-l-purple bg-purple-50/70" : ""}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <button
          type="button"
          className="mt-0.5 grid cursor-pointer place-items-center border-0 bg-transparent p-0 text-slate-400 transition-colors hover:text-slate-700"
          onClick={handleToggleStatus}
          title={`Status: ${item.status}. Click to cycle.`}
        >
          {item.status === "COMPLETED" ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`m-0 text-sm font-semibold leading-snug text-ink ${item.status === "COMPLETED" ? "text-muted line-through" : ""}`}>
            {item.description}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {/* Status Badge */}
            <StatusBadge
              variant={
                item.status === "COMPLETED"
                  ? "green"
                  : item.status === "IN_PROGRESS"
                    ? "blue"
                    : "amber"
              }
            >
              {item.status === "IN_PROGRESS" ? "In Progress" : item.status === "COMPLETED" ? "Completed" : "Pending"}
            </StatusBadge>

            {/* Estimated time */}
            {item.estimatedTimeMin !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200/80 bg-indigo-50/60 px-2 py-0.5 text-[11px] font-mono font-medium text-indigo-900 shadow-2xs">
                <Clock size={11} className="text-indigo-500" />
                <span>Est: <strong className="font-semibold text-indigo-950">{item.estimatedTimeMin}m</strong></span>
              </span>
            )}

            {/* Actual effort */}
            {item.actualEffortMin !== null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono font-medium shadow-2xs ${
                  hasBoth && diff > 0
                    ? "border-danger-border bg-danger-bg text-danger"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <Timer size={11} className={hasBoth && diff > 0 ? "text-danger" : "text-slate-500"} />
                <span>Act: <strong className={`font-semibold ${hasBoth && diff > 0 ? "text-danger" : "text-slate-700"}`}>{item.actualEffortMin}m</strong></span>
                {hasBoth && diff !== 0 && (
                  <span
                    className={`rounded border px-1 text-[9px] font-bold ${
                      diff > 0
                        ? "border-danger-border bg-danger-bg text-danger"
                        : "border-success-border bg-success-bg text-success"
                    }`}
                  >
                    {diff > 0 ? `+${diff}m` : `${diff}m`}
                  </span>
                )}
              </span>
            )}

            {/* Note badge */}
            {item.note && !isEditingNote && (
              <span
                className="inline-flex max-w-[260px] cursor-pointer items-center gap-1 rounded-md border border-warning-border bg-warning-bg px-2 py-0.5 text-xs text-warning"
                onClick={() => setIsEditingNote(true)}
                title="Click to view/edit note"
              >
                <FileText size={12} />
                <span className="overflow-hidden whitespace-nowrap text-ellipsis">{item.note}</span>
              </span>
            )}
          </div>

          {/* Inline Note Editor */}
          {isEditingNote && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                className="h-7.5 flex-1 rounded-md border border-line px-2.5 text-xs text-ink outline-none focus:border-purple"
                placeholder="Add note or explanation for delay..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveNote();
                  if (e.key === "Escape") setIsEditingNote(false);
                }}
              />
              <button
                type="button"
                className="h-7.5 cursor-pointer rounded-md border-0 bg-purple px-2.5 text-xs font-semibold text-white transition-colors hover:bg-purple-hover"
                onClick={handleSaveNote}
              >
                Save
              </button>
              <button
                type="button"
                className="h-7.5 cursor-pointer rounded-md border border-line bg-card px-2.5 text-xs text-muted transition-colors hover:text-ink"
                onClick={() => setIsEditingNote(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Quick Live Timer Button */}
        <button
          type="button"
          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all shadow-2xs ${
            isRunning
              ? "border-amber-300 bg-amber-100 text-amber-900 shadow-xs animate-pulse"
              : "border-purple-300 bg-purple-50 text-purple hover:bg-purple-100 hover:border-purple-400"
          }`}
          onClick={handleQuickTimerClick}
          title={isRunning ? "Pause Live Timer" : "Start Live Timer"}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              <span>Pause Timer</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>{item.actualEffortMin ? "Resume" : "Track Time"}</span>
            </>
          )}
        </button>

        {/* Set Target Timer / Manual Log */}
        <button
          type="button"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-purple-200/80 bg-purple-50/60 text-purple transition-all hover:bg-purple-100 hover:border-purple-300 hover:shadow-xs"
          onClick={() => onOpenTimerModal(task, item)}
          title="Timer presets & manual effort logging"
        >
          <Timer size={15} />
        </button>

        {/* Note toggle */}
        {!item.note && (
          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-amber-200/80 bg-amber-50/60 text-amber-700 transition-all hover:bg-amber-100 hover:border-amber-300 hover:shadow-xs"
            onClick={() => setIsEditingNote(true)}
            title="Add delay explanation / note"
          >
            <FileText size={15} />
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-rose-200/80 bg-rose-50/60 text-rose-600 transition-all hover:bg-rose-100 hover:border-rose-300 hover:shadow-xs"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete line item"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Line Item"
        description="Remove this line item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          deleteTaskItem(item.id);
          showToast("Line item removed", "success");
          setShowDeleteConfirm(false);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
