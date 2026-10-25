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
    pillClass: string;
    colStyle: string;
    countStyle: string;
    dotStyle: string;
    items: Array<{ task: Task; item: TaskItem }>;
  }[] = [
    {
      status: "PENDING",
      title: "Pending",
      pillClass: "status-amber",
      colStyle: "border-t-3 border-t-amber-400 bg-[#fdfbf6] border border-[#f3ebdc]",
      countStyle: "bg-amber-100 text-amber-900 border border-amber-300/70",
      dotStyle: "bg-amber-500",
      items: itemsWithParent.filter((x) => x.item.status === "PENDING"),
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      pillClass: "status-blue",
      colStyle: "border-t-3 border-t-blue-500 bg-[#f8faff] border border-[#e2ecfd]",
      countStyle: "bg-blue-100 text-blue-900 border border-blue-300/70",
      dotStyle: "bg-blue-500",
      items: itemsWithParent.filter((x) => x.item.status === "IN_PROGRESS"),
    },
    {
      status: "COMPLETED",
      title: "Completed",
      pillClass: "status-green",
      colStyle: "border-t-3 border-t-emerald-500 bg-[#f6fcf8] border border-[#def2e6]",
      countStyle: "bg-emerald-100 text-emerald-900 border border-emerald-300/70",
      dotStyle: "bg-emerald-500",
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
        className={`rounded-lg border bg-white p-3.5 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all ${
          isRunning ? "border-2 border-[var(--purple)] shadow-md" : "border-[#eeedf3]"
        } ${item.status === "COMPLETED" ? "opacity-90" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-[var(--purple)] text-[11px] font-bold uppercase">
            {task.project?.name || "Project"}
          </span>
          <span className="text-[#9492a4] text-[11px]">{task.taskName}</span>
        </div>

        <p
          className={`m-0 mb-2.5 text-[#2c2a3f] text-sm font-semibold leading-snug ${
            item.status === "COMPLETED" ? "line-through text-[#9290a2]" : ""
          }`}
        >
          {item.description}
        </p>

        {/* Structured & Compact Time Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {item.estimatedTimeMin !== null && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f4f3f8] border border-[#e5e3ec] text-[#636077] text-[11px] font-mono font-medium shadow-2xs">
              <Clock size={11} className="text-[#88859e]" />
              <span>
                Est:{" "}
                <strong className="font-semibold text-[#201e33]">
                  {item.estimatedTimeMin}m
                </strong>
              </span>
            </span>
          )}
          {item.actualEffortMin !== null && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium shadow-2xs border ${
                isOvertime
                  ? "bg-[#fff2f2] border-[#fecdd3] text-[#b91c1c]"
                  : "bg-[#f5f2fe] border-[#ded7fb] text-[var(--purple)]"
              }`}
            >
              <Timer
                size={11}
                className={isOvertime ? "text-[#dc2626]" : "text-[var(--purple)]"}
              />
              <span>
                Act:{" "}
                <strong
                  className={`font-semibold ${
                    isOvertime ? "text-[#991b1b]" : "text-[#4d3abf]"
                  }`}
                >
                  {item.actualEffortMin}m
                </strong>
              </span>
              {isOvertime && (
                <span className="px-1 rounded bg-[#fee2e2] text-[#991b1b] text-[9px] font-bold">
                  +{actual - estimated}m
                </span>
              )}
            </span>
          )}
        </div>

        {/* Note */}
        {item.note && (
          <div className="flex items-start gap-1.5 p-1.5 px-2 rounded-md bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs mb-2.5">
            <FileText size={11} className="mt-0.5 shrink-0" />
            <span>{item.note}</span>
          </div>
        )}

        {/* Controls footer */}
        <div className="flex items-center justify-between gap-2 border-t border-[#f5f4f8] pt-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                isRunning
                  ? "bg-amber-200 border-amber-300 text-amber-900"
                  : "bg-[#f7f5ff] border-[#e2ddf8] text-[var(--purple)] hover:bg-[#ece8fe]"
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
              className="grid place-items-center w-7 h-7 rounded-md border border-[#e7e6ee] bg-white text-[#767489] hover:text-[var(--purple)] hover:border-[#cbbeff] cursor-pointer"
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
                className="grid place-items-center w-6.5 h-6.5 rounded-md border border-[#e7e6ee] bg-white text-[#8b899d] hover:bg-[#f5f4f9] hover:text-[var(--ink)] cursor-pointer"
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
                className="grid place-items-center w-6.5 h-6.5 rounded-md border border-[#e7e6ee] bg-white text-[#8b899d] hover:bg-[#f5f4f9] hover:text-[var(--ink)] cursor-pointer"
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
        <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dotStyle}`} />
            <span className={`status-pill ${col.pillClass}`}>{col.title}</span>
            <span
              className={`grid place-items-center min-w-5 h-5 rounded-full text-xs font-bold px-2 ${col.countStyle}`}
            >
              {col.items.length} {col.items.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          <span className="text-xs text-[var(--muted)] font-medium">
            Filtered View ({col.title})
          </span>
        </div>

        {col.items.length === 0 ? (
          <div className="grid place-items-center min-h-[220px] border border-dashed border-black/10 rounded-xl text-[#a4a2b2] text-xs text-center p-6">
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
          <div className="flex items-center justify-between mb-3.5 px-1 pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${col.dotStyle}`} />
              <span className={`status-pill ${col.pillClass}`}>{col.title}</span>
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
              <div className="grid place-items-center min-h-[120px] border border-dashed border-[#dcd9e5] rounded-lg text-[#a4a2b2] text-xs text-center p-4">
                <p className="m-0">No tasks {col.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
