"use client";

import React, { useState, useMemo } from "react";
import type { Task, TaskItem } from "@/lib/tasks/task.schema";
import { useTaskContext } from "@/lib/tasks/task-context";
import { useProjects } from "@/lib/projects/use-project";
import { ActiveTimerBanner } from "./active-timer-banner";
import { TaskCard } from "./task-card";
import { TaskKanbanView } from "./task-kanban-view";
import { TaskFormModal } from "./task-form-modal";
import { TimerSettingsModal } from "./timer-settings-modal";
import { DayEntryModal } from "./day-entry-modal";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  List,
  Columns,
  Coffee,
  Sun,
  Briefcase,
  Palmtree,
} from "lucide-react";

export function TaskManagement() {
  const {
    currentDayEntry,
    selectedDate,
    setSelectedDate,
  } = useTaskContext();

  const projectsQuery = useProjects();

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDayEntryModal, setShowDayEntryModal] = useState(false);
  const [timerModalTarget, setTimerModalTarget] = useState<{
    task: Task;
    item: TaskItem;
  } | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Date Navigation Helpers
  function handleShiftDate(days: number) {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  }

  function handleSetToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  }

  const isToday = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return selectedDate === `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Formatted date string (e.g., "Thursday, October 23, 2026")
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!currentDayEntry || !currentDayEntry.tasks) return [];

    return currentDayEntry.tasks
      .filter((task) => {
        // Project filter
        if (selectedProjectId !== "ALL" && task.projectId !== selectedProjectId) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTask = task.taskName.toLowerCase().includes(q);
          const matchesItems = task.items.some(
            (it) =>
              it.description.toLowerCase().includes(q) ||
              (it.note && it.note.toLowerCase().includes(q))
          );
          if (!matchesTask && !matchesItems) return false;
        }

        return true;
      })
      .map((task) => {
        // Status filter applies to line items
        if (selectedStatus === "ALL") return task;

        const filteredItems = task.items.filter(
          (it) => it.status === selectedStatus
        );
        return {
          ...task,
          items: filteredItems,
        };
      })
      .filter((task) => {
        // Only keep tasks that have items matching the status filter (or if ALL)
        if (selectedStatus === "ALL") return true;
        return task.items.length > 0;
      });
  }, [currentDayEntry, selectedProjectId, searchQuery, selectedStatus]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedProjectId !== "ALL" ||
    selectedStatus !== "ALL";

  function handleClearFilters() {
    setSearchQuery("");
    setSelectedProjectId("ALL");
    setSelectedStatus("ALL");
  }

  function handleOpenTimerModal(task: Task, item: TaskItem) {
    setTimerModalTarget({ task, item });
  }

  function handleCloseTimerModal() {
    setTimerModalTarget(null);
  }

  const scheduleTypeName = useMemo(() => {
    const type = currentDayEntry?.entryType ?? "WORKING_DAY";
    switch (type) {
      case "WORKING_DAY":
        return "Working Day";
      case "WEEKEND":
        return "Weekend";
      case "PUBLIC_HOLIDAY":
        return "Holiday";
      case "PERSONAL_LEAVE":
        return "Leave";
      default:
        return "Working Day";
    }
  }, [currentDayEntry?.entryType]);

  return (
    <div className="w-full max-w-[1360px] mx-auto">
      {/* Top Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="projects-title">My Tasks & Time Tracker</h1>
          <p className="projects-subtitle">
            Plan your daily deliverables, set countdown timers, and track completion time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Date Selector Navigation */}
          <div className="inline-flex items-center h-[38px] bg-card border border-line rounded-lg px-1 shadow-2xs whitespace-nowrap shrink-0">
            <button
              type="button"
              className="grid place-items-center w-7 h-7 rounded-md text-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              onClick={() => handleShiftDate(-1)}
              title="Previous day"
            >
              <ChevronLeft size={16} />
            </button>

            <label className="relative inline-flex items-center gap-1.5 px-2.5 h-7 text-xs font-semibold text-ink-secondary hover:bg-canvas rounded-md transition-colors cursor-pointer" title="Choose specific date">
              <Calendar size={14} className="text-purple" />
              <span>{formattedDateTitle}</span>
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="grid place-items-center w-7 h-7 rounded-md text-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              onClick={() => handleShiftDate(1)}
              title="Next day"
            >
              <ChevronRight size={16} />
            </button>

            {!isToday && (
              <button
                type="button"
                className="ml-0.5 border-0 bg-purple-subtle text-purple px-2 py-1 rounded text-[11px] font-semibold hover:bg-purple-subtle/80 transition-colors cursor-pointer"
                onClick={handleSetToday}
                title="Jump to today"
              >
                Today
              </button>
            )}
          </div>

          {/* Day Schedule Type Selector */}
          <button
            type="button"
            className="inline-flex items-center gap-2 h-[38px] px-3 rounded-lg bg-card border border-line text-ink text-xs font-semibold hover:bg-purple-subtle/50 hover:border-purple-border hover:text-purple shadow-2xs whitespace-nowrap shrink-0 transition-all cursor-pointer"
            onClick={() => setShowDayEntryModal(true)}
            title="Click to change schedule (Working Day, Weekend, Holiday, Leave)"
          >
            <span className="grid place-items-center shrink-0">
              {currentDayEntry?.entryType === "WEEKEND" ? (
                <Sun size={14} className="text-warning" />
              ) : currentDayEntry?.entryType === "PUBLIC_HOLIDAY" ? (
                <Coffee size={14} className="text-warning" />
              ) : currentDayEntry?.entryType === "PERSONAL_LEAVE" ? (
                <Palmtree size={14} className="text-warning" />
              ): (
                <Briefcase size={14} className="text-purple" />
              )}
            </span>
            <span className="font-semibold text-ink">
              {scheduleTypeName}
            </span>
            <ChevronDown size={13} className="text-subtle ml-0.5 shrink-0" />
          </button>

          {/* New Task Button */}
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowTaskModal(true)}
          >
            <span>+</span> New Task
          </button>
        </div>
      </header>

      {/* Active Timer Live Banner */}
      <ActiveTimerBanner />

      {/* Weekend or Holiday Alert Notice */}
      {currentDayEntry?.entryType !== "WORKING_DAY" && (
        <div className="flex items-center gap-3.5 p-3.5 sm:px-4.5 rounded-xl bg-warning-bg border border-warning-border mb-5">
          <span className="text-warning grid place-items-center shrink-0">
            {currentDayEntry?.entryType === "WEEKEND" ? (
              <Sun size={18} />
            ) : currentDayEntry?.entryType === "PUBLIC_HOLIDAY" ? (
              <Coffee size={18} />
            ) : (
              <Briefcase size={18} />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <strong className="block text-warning text-sm font-semibold">
              Scheduled as {currentDayEntry?.entryType.replace("_", " ")}
            </strong>
            <p className="mt-0.5 text-warning/80 text-xs">
              You can still log tasks or start timers, or click to adjust this day&apos;s schedule.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary text-xs px-3 py-1.5 h-auto shrink-0"
            onClick={() => setShowDayEntryModal(true)}
          >
            Edit Schedule
          </button>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 p-3 rounded-xl border border-line bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 h-[35px] w-full sm:w-60 border border-line rounded-lg bg-card px-2.5 shadow-2xs">
            <Search size={15} className="text-muted shrink-0" />
            <input
              type="text"
              className="border-0 outline-none bg-transparent text-ink text-xs w-full placeholder:text-subtle"
              placeholder="Search tasks or line items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Project Filter */}
          <select
            className="h-[35px] border border-line rounded-lg bg-card px-2.5 text-ink-secondary text-xs font-medium outline-none cursor-pointer shadow-2xs"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="ALL">All Projects</option>
            {projectsQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="inline-flex bg-canvas border border-line/60 p-0.5 rounded-lg gap-0.5">
            <button
              type="button"
              className={`border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                selectedStatus === "ALL" ? "bg-card text-ink shadow-xs" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setSelectedStatus("ALL")}
            >
              All
            </button>
            <button
              type="button"
              className={`border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                selectedStatus === "PENDING" ? "bg-card text-ink shadow-xs" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setSelectedStatus("PENDING")}
            >
              Pending
            </button>
            <button
              type="button"
              className={`border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                selectedStatus === "IN_PROGRESS" ? "bg-card text-ink shadow-xs" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setSelectedStatus("IN_PROGRESS")}
            >
              In Progress
            </button>
            <button
              type="button"
              className={`border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                selectedStatus === "COMPLETED" ? "bg-card text-ink shadow-xs" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setSelectedStatus("COMPLETED")}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
          {/* View switcher */}
          <div className="inline-flex bg-card border border-line p-0.5 rounded-lg gap-0.5 shadow-2xs">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                viewMode === "list" ? "bg-purple-subtle text-purple" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setViewMode("list")}
              title="Grouped List View"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                viewMode === "kanban" ? "bg-purple-subtle text-purple" : "bg-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setViewMode("kanban")}
              title="Kanban Board View"
            >
              <Columns size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Task List or Kanban */}
      <section>
        {filteredTasks.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">⏱</div>
            <h3>No tasks found for this view</h3>
            <p>
              {searchQuery || selectedProjectId !== "ALL" || selectedStatus !== "ALL"
                ? "Try clearing filters or search query."
                : `Plan your work for ${formattedDateTitle} to start tracking time.`}
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowTaskModal(true)}
            >
              <span>+</span> Add Task for {formattedDateTitle}
            </button>
          </div>
        ) : viewMode === "list" ? (
          <div className="grid gap-4.5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenTimerModal={handleOpenTimerModal}
              />
            ))}
          </div>
        ) : (
          <TaskKanbanView
            tasks={filteredTasks}
            onOpenTimerModal={handleOpenTimerModal}
            selectedStatus={selectedStatus}
          />
        )}
      </section>

      {/* Modals */}
      {showTaskModal && (
        <TaskFormModal onClose={() => setShowTaskModal(false)} />
      )}

      {showDayEntryModal && (
        <DayEntryModal onClose={() => setShowDayEntryModal(false)} />
      )}

      {timerModalTarget && (
        <TimerSettingsModal
          task={timerModalTarget.task}
          item={timerModalTarget.item}
          onClose={handleCloseTimerModal}
        />
      )}
    </div>
  );
}
