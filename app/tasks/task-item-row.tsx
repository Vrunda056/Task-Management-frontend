"use client";

import React, { useState } from "react";
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

interface TaskItemRowProps {
  task: Task;
  item: TaskItem;
  onOpenTimerModal: (task: Task, item: TaskItem) => void;
}

export function TaskItemRow({ task, item, onOpenTimerModal }: TaskItemRowProps) {
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    updateTaskItem,
    deleteTaskItem,
  } = useTaskContext();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.note ?? "");

  const isCurrentActiveTimer =
    activeTimer?.taskItemId === item.id;

  const isRunning = isCurrentActiveTimer && activeTimer.isRunning;

  // Status toggle cycling: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING
  function handleToggleStatus() {
    let nextStatus: TaskItemStatus = "IN_PROGRESS";
    if (item.status === "PENDING") nextStatus = "IN_PROGRESS";
    else if (item.status === "IN_PROGRESS") nextStatus = "COMPLETED";
    else nextStatus = "PENDING";

    updateTaskItem(item.id, { status: nextStatus });
  }

  function handleQuickTimerClick() {
    if (isRunning) {
      pauseTimer();
    } else {
      // Start stopwatch or resume
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
  const diff = actual - estimated; // positive = overtime, negative = under time

  return (
    <div
      className={`flex items-center justify-between gap-4 p-3.5 sm:px-5 transition-colors ${
        item.status === "COMPLETED" ? "bg-[#fafbfa]" : "hover:bg-[#fdfdfd]"
      } ${isRunning ? "bg-[#fbf9ff] border-l-[3px] border-l-[var(--purple)]" : ""}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          type="button"
          className="border-0 bg-transparent p-0 cursor-pointer text-[#b5b3c3] grid place-items-center mt-0.5 hover:text-[var(--purple)] transition-colors"
          onClick={handleToggleStatus}
          title={`Status: ${item.status}. Click to cycle.`}
        >
          {item.status === "COMPLETED" ? (
            <CheckCircle2 size={18} className="text-emerald-500!" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`m-0 text-[#3b394f] text-sm font-medium leading-snug ${item.status === "COMPLETED" ? "line-through text-[#9e9caa]" : ""}`}>
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {/* Status Pill */}
            <span
              className={`status-pill status-${
                item.status === "COMPLETED"
                  ? "green"
                  : item.status === "IN_PROGRESS"
                  ? "blue"
                  : "amber"
              }`}
            >
              {item.status === "IN_PROGRESS" ? "In Progress" : item.status === "COMPLETED" ? "Completed" : "Pending"}
            </span>

            {/* Estimated time */}
            {item.estimatedTimeMin !== null && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f4f3f8] border border-[#e5e3ec] text-[#636077] text-[11px] font-mono font-medium shadow-2xs">
                <Clock size={11} className="text-[#88859e]" />
                <span>Est: <strong className="font-semibold text-[#201e33]">{item.estimatedTimeMin}m</strong></span>
              </span>
            )}

            {/* Actual effort */}
            {item.actualEffortMin !== null && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium shadow-2xs border ${
                  hasBoth && diff > 0
                    ? "bg-[#fff2f2] border-[#fecdd3] text-[#b91c1c]"
                    : "bg-[#f5f2fe] border-[#ded7fb] text-[var(--purple)]"
                }`}
              >
                <Timer size={11} className={hasBoth && diff > 0 ? "text-[#dc2626]" : "text-[var(--purple)]"} />
                <span>Act: <strong className={`font-semibold ${hasBoth && diff > 0 ? "text-[#991b1b]" : "text-[#4d3abf]"}`}>{item.actualEffortMin}m</strong></span>
                {hasBoth && diff !== 0 && (
                  <span
                    className={`px-1 rounded text-[9px] font-bold ${
                      diff > 0
                        ? "bg-[#fee2e2] text-[#991b1b]"
                        : "bg-[#eaf9f0] text-[#065f46]"
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-xs cursor-pointer max-w-[260px]"
                onClick={() => setIsEditingNote(true)}
                title="Click to view/edit note"
              >
                <FileText size={12} />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.note}</span>
              </span>
            )}
          </div>

          {/* Inline Note Editor */}
          {isEditingNote && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                className="flex-1 h-7.5 border border-[#dcd9e9] rounded-md px-2.5 text-xs text-[var(--ink)] outline-none"
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
                className="h-7.5 px-2.5 border-0 bg-[var(--purple)] text-white rounded-md text-xs font-semibold cursor-pointer"
                onClick={handleSaveNote}
              >
                Save
              </button>
              <button
                type="button"
                className="h-7.5 px-2.5 border border-[#dedde6] bg-white text-[#666] rounded-md text-xs cursor-pointer"
                onClick={() => setIsEditingNote(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Live Timer Button */}
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            isRunning
              ? "bg-amber-200 border border-amber-300 text-amber-900"
              : "bg-[#f5f3ff] border border-[#e0d9fc] text-[var(--purple)] hover:bg-[#ede9fe]"
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
          className="grid place-items-center w-7.5 h-7.5 border border-[#ecebf1] rounded-md bg-white text-[#77768a] hover:bg-[#f7f6fb] hover:text-[var(--purple)] hover:border-[#dcd7fa] transition-colors cursor-pointer"
          onClick={() => onOpenTimerModal(task, item)}
          title="Timer presets & manual effort logging"
        >
          <Timer size={15} />
        </button>

        {/* Note toggle */}
        {!item.note && (
          <button
            type="button"
            className="grid place-items-center w-7.5 h-7.5 border border-[#ecebf1] rounded-md bg-white text-[#77768a] hover:bg-[#f7f6fb] hover:text-[var(--purple)] hover:border-[#dcd7fa] transition-colors cursor-pointer"
            onClick={() => setIsEditingNote(true)}
            title="Add delay explanation / note"
          >
            <FileText size={15} />
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          className="grid place-items-center w-7.5 h-7.5 border border-[#ecebf1] rounded-md bg-white text-[#77768a] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
          onClick={() => {
            if (window.confirm("Remove this item?")) {
              deleteTaskItem(item.id);
            }
          }}
          title="Delete line item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
