"use client";

import React from "react";
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
} from "lucide-react";
import { StatusBadge, type BadgeVariant } from "@/components/ui";

interface TaskKanbanViewProps {
  tasks: Task[];
  onOpenTimerModal: (task: Task, item: TaskItem) => void;
  selectedStatus?: string;
}

export function TaskKanbanView({
  tasks,
  onOpenTimerModal,
  selectedStatus = "ALL",
}: TaskKanbanViewProps) {
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    updateTaskItem,
  } = useTaskContext();

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
      colStyle: "border-t-3 border-t-warning bg-warning-bg/30 border border-warning-border/60",
      countStyle: "bg-warning-bg text-warning border border-warning-border",
      dotStyle: "bg-warning",
      items: itemsWithParent.filter((x) => x.item.status === "PENDING"),
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      badgeVariant: "blue",
      colStyle: "border-t-3 border-t-info bg-info-bg/30 border border-info-border/60",
      countStyle: "bg-info-bg text-info border border-info-border",
      dotStyle: "bg-info",
      items: itemsWithParent.filter((x) => x.item.status === "IN_PROGRESS"),
    },
    {
      status: "COMPLETED",
      title: "Completed",
      badgeVariant: "green",
      colStyle: "border-t-3 border-t-success bg-success-bg/30 border border-success-border/60",
      countStyle: "bg-success-bg text-success border border-success-border",
      dotStyle: "bg-success",
      items: itemsWithParent.filter((x) => x.item.status === "COMPLETED"),
    },
  ];

  function moveItem(itemId: string, newStatus: TaskItemStatus) {
    updateTaskItem(itemId, { status: newStatus });
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
          <span className="text-muted text-[11px]">{task.taskName}</span>
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
              <Clock size={11} className="text-muted" />
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
        {item.note && (
          <div className="flex items-start gap-1.5 p-1.5 px-2 rounded-md bg-warning-bg border border-warning-border text-warning text-xs mb-2.5">
            <FileText size={11} className="mt-0.5 shrink-0" />
            <span>{item.note}</span>
          </div>
        )}

        {/* Controls footer */}
        <div className="flex items-center justify-between gap-2 border-t border-line pt-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                isRunning
                  ? "bg-warning-bg border-warning-border text-warning"
                  : "bg-purple-subtle border-purple-border text-purple hover:bg-purple-subtle/80"
              }`}
              onClick={() => {
                if (isRunning) pauseTimer();
                else startTimer(task, item, { mode: "stopwatch" });
              }}
            >
              {isRunning ? (
                <>
                  <Pause size={13} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>{item.actualEffortMin ? "Resume" : "Track"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="grid place-items-center w-7 h-7 rounded-md border border-line bg-card text-muted hover:text-purple hover:border-purple-border cursor-pointer transition-colors"
              onClick={() => onOpenTimerModal(task, item)}
              title="Timer presets and manual log"
            >
              <Timer size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1">
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
      </div>
    );
  }

  // Filtered view: only display the single selected column with a responsive multi-card grid
  if (isFilteredSingleColumn && visibleColumns.length === 1) {
    const col = visibleColumns[0];
    return (
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

            {col.items.length === 0 && (
              <div className="grid place-items-center min-h-[120px] border border-dashed border-line rounded-lg text-muted text-xs text-center p-4">
                <p className="m-0">No tasks {col.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
