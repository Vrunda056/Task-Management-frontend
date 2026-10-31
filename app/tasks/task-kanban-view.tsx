"use client";

import React, { useState, type FormEvent } from "react";
import type { Task, TaskItem, TaskItemStatus } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import {
  Play,
  Pause,
  Timer,
  Clock,
  ChevronRight,
  ChevronLeft,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, ConfirmDialog, StatusBadge, type BadgeVariant, useToast } from "@/components/ui";

interface TaskKanbanViewProps {
  tasks: Task[];
  selectedStatus?: string;
}

export function TaskKanbanView({
  tasks,
  selectedStatus = "ALL",
}: TaskKanbanViewProps) {
  const { showToast } = useToast();
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    updateTaskItem,
    addTaskItem,
    deleteTaskItem,
    deleteTask,
  } = useTaskContext();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [addingItemTaskId, setAddingItemTaskId] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemEstimate, setNewItemEstimate] = useState("30");
  const [deletingItem, setDeletingItem] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Flatten items with parent task references
  const itemsWithParent: Array<{ task: Task; item: TaskItem }> = [];
  tasks.forEach((t) => {
    t.items.forEach((it) => {
      itemsWithParent.push({ task: t, item: it });
    });
  });

  const columns: {
    status: TaskItemStatus;
    title: string;
    badgeVariant: BadgeVariant;
    colStyle: string;
    countStyle: string;
    dotStyle: string;
    items: Array<{ task: Task; item: TaskItem }>;
  }[] = [
    {
      status: "PENDING",
      title: "Pending",
      badgeVariant: "amber",
      colStyle: "border-t-3 border-t-warning bg-warning-bg/70 border border-warning-border/80",
      countStyle: "bg-warning-bg text-warning border border-warning-border",
      dotStyle: "bg-warning",
      items: itemsWithParent.filter((x) => x.item.status === "PENDING"),
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      badgeVariant: "blue",
      colStyle: "border-t-3 border-t-info bg-info-bg/70 border border-info-border/80",
      countStyle: "bg-info-bg text-info border border-info-border",
      dotStyle: "bg-info",
      items: itemsWithParent.filter((x) => x.item.status === "IN_PROGRESS"),
    },
    {
      status: "COMPLETED",
      title: "Completed",
      badgeVariant: "green",
      colStyle: "border-t-3 border-t-success bg-success-bg/90 border border-success-border/100",
      countStyle: "bg-success-bg text-success border border-success-border",
      dotStyle: "bg-success",
      items: itemsWithParent.filter((x) => x.item.status === "COMPLETED"),
    },
  ];

  const taskActionItemIds = new Set<string>();
  const tasksWithActions = new Set<string>();
  for (const { task, item } of itemsWithParent) {
    if (!tasksWithActions.has(task.id)) {
      taskActionItemIds.add(item.id);
      tasksWithActions.add(task.id);
    }
  }

  function moveItem(itemId: string, newStatus: TaskItemStatus) {
    updateTaskItem(itemId, { status: newStatus });
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>, task: Task) {
    event.preventDefault();
    const description = newItemDescription.trim();
    if (!description) return;

    addTaskItem(task.id, {
      description,
      estimatedTimeMin: newItemEstimate
        ? Number.parseInt(newItemEstimate, 10) || null
        : null,
    });
    showToast("Line item added", "success");
    setAddingItemTaskId(null);
    setNewItemDescription("");
    setNewItemEstimate("30");
  }

  function cancelAddItem() {
    setAddingItemTaskId(null);
    setNewItemDescription("");
    setNewItemEstimate("30");
  }

  function startEditingNote(item: TaskItem) {
    setEditingNoteId(item.id);
    setNoteDraft(item.note ?? "");
  }

  function saveNote(item: TaskItem) {
    updateTaskItem(item.id, { note: noteDraft.trim() || null });
    setEditingNoteId(null);
  }

  function renderTaskActions(task: Task) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-purple-border bg-purple-subtle text-purple transition-colors hover:border-purple hover:bg-purple hover:text-white"
          onClick={() => {
            setAddingItemTaskId(task.id);
            setNewItemDescription("");
            setNewItemEstimate("30");
          }}
          title="Add line item"
          aria-label={`Add line item to ${task.taskName}`}
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-danger-border bg-danger-bg text-danger transition-colors hover:border-danger hover:bg-danger hover:text-white"
          onClick={() => setDeletingTask(task)}
          title="Delete task"
          aria-label={`Delete task ${task.taskName}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  function renderAddItemForm(task: Task) {
    if (addingItemTaskId !== task.id) return null;

    return (
      <form
        className="mt-2.5 grid gap-2 border-t border-line pt-2.5"
        onSubmit={(event) => handleAddItem(event, task)}
      >
        <input
          type="text"
          className="modal-input !min-h-9 !text-xs"
          placeholder="Describe the line item"
          value={newItemDescription}
          onChange={(event) => setNewItemDescription(event.target.value)}
          autoFocus
          required
        />
        <div className="flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted">
            Estimate
            <input
              type="number"
              min="0"
              max="720"
              className="modal-input !min-h-9 !text-xs"
              value={newItemEstimate}
              onChange={(event) => setNewItemEstimate(event.target.value)}
              aria-label="Estimated minutes"
            />
            min
          </label>
          <Button size="sm" type="submit">Add</Button>
          <Button size="sm" variant="secondary" onClick={cancelAddItem}>Cancel</Button>
        </div>
      </form>
    );
  }

  const isFilteredSingleColumn = selectedStatus && selectedStatus !== "ALL";
  const visibleColumns = isFilteredSingleColumn
    ? columns.filter((col) => col.status === selectedStatus)
    : columns;

  function renderCard(task: Task, item: TaskItem, col: typeof columns[0]) {
    const isRunning =
      activeTimer?.taskItemId === item.id && activeTimer.isRunning;

    const estimated = item.estimatedTimeMin ?? 0;
    const actual = item.actualEffortMin ?? 0;
    const isOvertime = estimated > 0 && actual > estimated;

    return (
      <div
        key={item.id}
        className={`rounded-lg border bg-card p-3.5 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all ${
          isRunning ? "border-2 border-purple shadow-md" : "border-line"
        } ${item.status === "COMPLETED" ? "opacity-90" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-purple text-[11px] font-bold uppercase">
            {task.project?.name || "Project"}
          </span>
          <span className="min-w-0 flex-1 truncate text-muted text-[11px]">{task.taskName}</span>
          {taskActionItemIds.has(item.id) && renderTaskActions(task)}
        </div>

        <p
          className={`m-0 mb-2.5 text-ink text-sm font-semibold leading-snug ${
            item.status === "COMPLETED" ? "line-through text-muted" : ""
          }`}
        >
          {item.description}
        </p>

        {/* Structured & Compact Time Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {item.estimatedTimeMin !== null && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-canvas border border-line text-ink-secondary text-[11px] font-mono font-medium shadow-2xs">
              <Clock size={11} className="text-purple" />
              <span>
                Est:{" "}
                <strong className="font-semibold text-ink">
                  {item.estimatedTimeMin}m
                </strong>
              </span>
            </span>
          )}
          {item.actualEffortMin !== null && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium shadow-2xs border ${
                isOvertime
                  ? "bg-danger-bg border-danger-border text-danger"
                  : "bg-purple-subtle border-purple-border text-purple"
              }`}
            >
              <Timer
                size={11}
                className={isOvertime ? "text-danger" : "text-purple"}
              />
              <span>
                Act:{" "}
                <strong
                  className={`font-semibold ${
                    isOvertime ? "text-danger" : "text-purple"
                  }`}
                >
                  {item.actualEffortMin}m
                </strong>
              </span>
              {isOvertime && (
                <span className="px-1 rounded bg-danger-bg border border-danger-border text-danger text-[9px] font-bold">
                  +{actual - estimated}m
                </span>
              )}
            </span>
          )}
        </div>

        {/* Note */}
        {editingNoteId === item.id ? (
          <div className="mb-2.5 flex items-center gap-2">
            <input
              type="text"
              className="h-8 min-w-0 flex-1 rounded-md border border-line px-2.5 text-xs text-ink outline-none focus:border-purple"
              placeholder="Add note or explanation for delay..."
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") saveNote(item);
                if (event.key === "Escape") setEditingNoteId(null);
              }}
            />
            <button
              type="button"
              className="h-8 cursor-pointer rounded-md border-0 bg-purple px-2.5 text-xs font-semibold text-white transition-colors hover:bg-purple-hover"
              onClick={() => saveNote(item)}
            >
              Save
            </button>
            <button
              type="button"
              className="h-8 cursor-pointer rounded-md border border-line bg-card px-2.5 text-xs text-muted transition-colors hover:text-ink"
              onClick={() => setEditingNoteId(null)}
            >
              Cancel
            </button>
          </div>
        ) : item.note ? (
          <button
            type="button"
            className="mb-2.5 flex max-w-full cursor-pointer items-start gap-1.5 rounded-md border border-warning-border bg-warning-bg p-1.5 px-2 text-left text-xs text-warning"
            onClick={() => startEditingNote(item)}
            title="Click to edit note"
          >
            <FileText size={11} className="mt-0.5 shrink-0" />
            <span className="break-words">{item.note}</span>
          </button>
        ) : null}

        {/* Controls footer */}
        <div className="flex items-center justify-between gap-2 border-t border-line pt-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold shadow-2xs transition-all ${
                isRunning
                  ? "border-amber-300 bg-amber-100 text-amber-900 shadow-xs animate-pulse"
                  : "border-purple-300 bg-purple-50 text-purple hover:bg-purple-100 hover:border-purple-400"
              }`}
              onClick={() => {
                if (isRunning) pauseTimer();
                else startTimer(task, item);
              }}
              title={
                isRunning
                  ? "Pause timer"
                  : item.actualEffortMin
                    ? "Resume timer"
                    : "Track time"
              }
            >
              {isRunning ? (
                <>
                  <Pause size={13} />
                  <span>Pause Timer</span>
                </>
              ) : item.actualEffortMin ? (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>Resume</span>
                </>
              ) : (
                <Timer size={15} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-amber-200/80 bg-amber-50/60 text-amber-700 transition-all hover:bg-amber-100 hover:border-amber-300 hover:shadow-xs"
              onClick={() => startEditingNote(item)}
              title={item.note ? "Edit note" : "Add note"}
              aria-label={item.note ? "Edit note" : "Add note"}
            >
              <FileText size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-danger-border bg-danger-bg text-danger transition-colors hover:bg-danger hover:text-white"
              onClick={() => setDeletingItem(item)}
              title="Delete line item"
              aria-label={`Delete line item ${item.description}`}
            >
              <Trash2 size={13} />
            </button>
            {col.status !== "PENDING" && (
              <button
                type="button"
                className="grid place-items-center w-6.5 h-6.5 rounded-md border border-line bg-card text-muted hover:bg-canvas hover:text-ink cursor-pointer transition-colors"
                onClick={() =>
                  moveItem(
                    item.id,
                    col.status === "COMPLETED" ? "IN_PROGRESS" : "PENDING"
                  )
                }
                title="Move left"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {col.status !== "COMPLETED" && (
              <button
                type="button"
                className="grid place-items-center w-6.5 h-6.5 rounded-md border border-line bg-card text-muted hover:bg-canvas hover:text-ink cursor-pointer transition-colors"
                onClick={() =>
                  moveItem(
                    item.id,
                    col.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED"
                  )
                }
                title="Move right"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
        {taskActionItemIds.has(item.id) && renderAddItemForm(task)}
      </div>
    );
  }

  function renderEmptyTask(task: Task) {
    return (
      <article
        key={task.id}
        className="rounded-lg border border-dashed border-line bg-card p-3.5 shadow-2xs"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-bold uppercase text-purple">
              {task.project?.name || "Project"}
            </p>
            <h3 className="mb-0 mt-1 text-sm font-semibold text-ink">{task.taskName}</h3>
            <p className="mb-0 mt-1 text-xs text-muted">No line items yet</p>
          </div>
          {renderTaskActions(task)}
        </div>
        {renderAddItemForm(task)}
      </article>
    );
  }

  // Filtered view: only display the single selected column with a responsive multi-card grid
  if (isFilteredSingleColumn && visibleColumns.length === 1) {
    const col = visibleColumns[0];
    return (
      <>
        <div
          className={`rounded-xl p-5 min-h-[480px] flex flex-col shadow-2xs transition-colors ${col.colStyle}`}
        >
          <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-line/60">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dotStyle}`} />
              <StatusBadge variant={col.badgeVariant}>{col.title}</StatusBadge>
              <span
                className={`grid place-items-center min-w-5 h-5 rounded-full text-xs font-bold px-2 ${col.countStyle}`}
              >
                {col.items.length} {col.items.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            <span className="text-xs text-muted font-medium">
              Filtered View ({col.title})
            </span>
          </div>

          {col.items.length === 0 ? (
            <div className="grid place-items-center min-h-[220px] border border-dashed border-line rounded-xl text-muted text-xs text-center p-6">
              <p className="m-0 font-medium">
                No tasks currently in {col.title.toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {col.items.map(({ task, item }) => renderCard(task, item, col))}
            </div>
          )}
        </div>
        <ConfirmDialog
          open={Boolean(deletingItem)}
          title="Delete Line Item"
          description={`Remove "${deletingItem?.description ?? ""}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (!deletingItem) return;
            deleteTaskItem(deletingItem.id);
            showToast("Line item removed", "success");
            setDeletingItem(null);
          }}
          onClose={() => setDeletingItem(null)}
        />
        <ConfirmDialog
          open={Boolean(deletingTask)}
          title="Delete Task"
          description={`Delete task "${deletingTask?.taskName ?? ""}" and all its items? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (!deletingTask) return;
            deleteTask(deletingTask.id);
            showToast(`Task "${deletingTask.taskName}" deleted`, "success");
            setDeletingTask(null);
          }}
          onClose={() => setDeletingTask(null)}
        />
      </>
    );
  }

  // "ALL" view: standard 3-column Kanban board
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
      {visibleColumns.map((col) => (
        <div
          key={col.status}
          className={`rounded-xl p-3.5 min-h-[500px] flex flex-col shadow-2xs transition-colors ${col.colStyle}`}
        >
          <div className="flex items-center justify-between mb-3.5 px-1 pb-2 border-b border-line/60">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${col.dotStyle}`} />
              <StatusBadge variant={col.badgeVariant}>{col.title}</StatusBadge>
              <span
                className={`grid place-items-center min-w-5 h-5 rounded-full text-[11px] font-bold px-1.5 ${col.countStyle}`}
              >
                {col.items.length}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {col.items.map(({ task, item }) => renderCard(task, item, col))}
            {col.status === "PENDING" &&
              selectedStatus === "ALL" &&
              tasks
                .filter((task) => task.items.length === 0)
                .map(renderEmptyTask)}

            {col.items.length === 0 &&
              !(col.status === "PENDING" &&
                selectedStatus === "ALL" &&
                tasks.some((task) => task.items.length === 0)) && (
              <div className="grid place-items-center min-h-[120px] border border-dashed border-line rounded-lg text-muted text-xs text-center p-4">
                <p className="m-0">No tasks {col.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Delete Line Item"
        description={`Remove "${deletingItem?.description ?? ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deletingItem) return;
          deleteTaskItem(deletingItem.id);
          showToast("Line item removed", "success");
          setDeletingItem(null);
        }}
        onClose={() => setDeletingItem(null)}
      />
      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete Task"
        description={`Delete task "${deletingTask?.taskName ?? ""}" and all its items? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deletingTask) return;
          deleteTask(deletingTask.id);
          showToast(`Task "${deletingTask.taskName}" deleted`, "success");
          setDeletingTask(null);
        }}
        onClose={() => setDeletingTask(null)}
      />
    </div>
  );
}
