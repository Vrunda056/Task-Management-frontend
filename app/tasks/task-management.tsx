"use client";

import { useState, useMemo } from "react";
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
  X,
  List,
  Columns,
  Coffee,
  Sun,
  Briefcase,
  Palmtree,
} from "lucide-react";
import {
  Button,
  EmptyState,
  FilterSelect,
  SearchInput,
  SegmentedToggle,
  Toolbar,
} from "@/components/ui";

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
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
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
    if (!currentDayEntry || !Array.isArray(currentDayEntry.tasks)) return [];

    return currentDayEntry.tasks
      .filter((task) => {
        if (selectedProjectId !== "ALL" && task.projectId !== selectedProjectId) {
          return false;
        }

        const items = Array.isArray(task.items) ? task.items : [];

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTask = task.taskName.toLowerCase().includes(q);
          const matchesItems = items.some(
            (it) =>
              it.description.toLowerCase().includes(q) ||
              (it.note && it.note.toLowerCase().includes(q)),
          );
          if (!matchesTask && !matchesItems) return false;
        }

        return true;
      })
      .map((task) => {
        const items = Array.isArray(task.items) ? task.items : [];
        if (selectedStatus === "ALL") return { ...task, items };

        const filteredItems = items.filter(
          (it) => it.status === selectedStatus,
        );
        return {
          ...task,
          items: filteredItems,
        };
      })
      .filter((task) => {
        if (selectedStatus === "ALL") return true;
        return (task.items ?? []).length > 0;
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
    <div className="mx-auto w-full max-w-[1360px]">
      {/* Top Header */}
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-[26px] font-bold leading-[1.2] tracking-[-0.025em] text-ink">
            My Tasks &amp; Time Tracker
          </h1>
          <p className="mt-1.5 m-0 text-sm font-normal leading-[1.45] text-muted">
            Plan your daily deliverables, set countdown timers, and track completion time
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {/* Date Selector Navigation */}
          <div className="inline-flex h-[38px] shrink-0 items-center whitespace-nowrap rounded-lg border border-line bg-card px-1 shadow-2xs">
            <button
              type="button"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
              onClick={() => handleShiftDate(-1)}
              title="Previous day"
            >
              <ChevronLeft size={16} />
            </button>

            <label className="relative inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-canvas" title="Choose specific date">
              <Calendar size={14} className="text-purple" />
              <span>{formattedDateTitle}</span>
              <input
                type="date"
                className="absolute inset-0 w-full cursor-pointer opacity-0"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
              onClick={() => handleShiftDate(1)}
              title="Next day"
            >
              <ChevronRight size={16} />
            </button>

            {!isToday && (
              <button
                type="button"
                className="ml-0.5 cursor-pointer rounded bg-purple-subtle px-2 py-1 text-[11px] font-semibold text-purple transition-colors hover:bg-purple-subtle/80"
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
            className="inline-flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-card px-3 text-xs font-semibold text-ink shadow-2xs transition-all hover:border-purple-border hover:bg-purple-subtle/50 hover:text-purple cursor-pointer"
            onClick={() => setShowDayEntryModal(true)}
            title="Click to change schedule (Working Day, Weekend, Holiday, Leave)"
          >
            <span className="grid shrink-0 place-items-center">
              {currentDayEntry?.entryType === "WEEKEND" ? (
                <Sun size={14} className="text-warning" />
              ) : currentDayEntry?.entryType === "PUBLIC_HOLIDAY" ? (
                <Coffee size={14} className="text-warning" />
              ) : currentDayEntry?.entryType === "PERSONAL_LEAVE" ? (
                <Palmtree size={14} className="text-warning" />
              ) : (
                <Briefcase size={14} className="text-purple" />
              )}
            </span>
            <span className="font-semibold text-ink">
              {scheduleTypeName}
            </span>
            <ChevronDown size={13} className="ml-0.5 shrink-0 text-subtle" />
          </button>

          {/* New Task Button */}
          <Button icon={<span className="text-base font-normal">+</span>} onClick={() => setShowTaskModal(true)}>
            New Task
          </Button>
        </div>
      </header>

      {/* Active Timer Live Banner */}
      <ActiveTimerBanner />

      {/* Weekend or Holiday Alert Notice */}
      {currentDayEntry?.entryType !== "WORKING_DAY" && (
        <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-warning-border bg-warning-bg p-3.5 sm:px-4.5">
          <span className="grid shrink-0 place-items-center text-warning">
            {currentDayEntry?.entryType === "WEEKEND" ? (
              <Sun size={18} />
            ) : currentDayEntry?.entryType === "PUBLIC_HOLIDAY" ? (
              <Coffee size={18} />
            ) : (
              <Briefcase size={18} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-semibold text-warning">
              Scheduled as {currentDayEntry?.entryType.replace("_", " ")}
            </strong>
            <p className="mt-0.5 text-xs text-warning/80">
              You can still log tasks or start timers, or click to adjust this day&apos;s schedule.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setShowDayEntryModal(true)}
          >
            Edit Schedule
          </Button>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <Toolbar>
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks or line items..."
            className="w-full sm:w-60"
            height={36}
          />

          {/* Project Filter */}
          <FilterSelect
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="ALL">All Projects</option>
            {projectsQuery.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </FilterSelect>

          {/* Status Tabs */}
          <SegmentedToggle
            value={selectedStatus}
            onChange={setSelectedStatus}
            activeTheme="gray"
            options={[
              { value: "ALL", label: "All" },
              { value: "PENDING", label: "Pending" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />

          {/* Clear filters button placed alongside the filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex h-9 shrink-0 whitespace-nowrap cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/90 px-3 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-300 hover:text-red-700 shadow-2xs"
            >
              <X size={14} className="text-red-500" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* View switcher strictly separated on the right */}
        <div className="flex shrink-0 items-center">
          <SegmentedToggle
            value={viewMode}
            onChange={(v) => setViewMode(v as "list" | "kanban")}
            activeTheme="gray"
            options={[
              { value: "list", label: "List", icon: <List size={15} />, title: "Grouped List View" },
              { value: "kanban", label: "Kanban", icon: <Columns size={15} />, title: "Kanban Board View" },
            ]}
          />
        </div>
      </Toolbar>

      {/* Main Task List or Kanban */}
      <section>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="⏱"
            title="No tasks found for this view"
            message={
              searchQuery || selectedProjectId !== "ALL" || selectedStatus !== "ALL"
                ? "Try clearing filters or search query."
                : `Plan your work for ${formattedDateTitle} to start tracking time.`
            }
            action={
              <Button icon={<span className="text-base font-normal">+</span>} onClick={() => setShowTaskModal(true)}>
                Add Task for {formattedDateTitle}
              </Button>
            }
          />
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-4">
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
