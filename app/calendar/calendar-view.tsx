"use client";

import Link from "next/link";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Coffee,
  Clock3,
  ListTodo,
  Palmtree,
  Sun,
} from "lucide-react";
import { useTaskContext } from "@/lib/tasks/task-context";
import type { DayEntry, EntryType } from "@/lib/tasks/task.schema";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ENTRY_TYPE_PRESENTATION: Record<
  EntryType,
  {
    icon: ComponentType<{ size?: number; className?: string }>;
    iconColor: string;
    background: string;
    border: string;
    selectedBorder: string;
  }
> = {
  WORKING_DAY: {
    icon: Briefcase,
    iconColor: "text-blue-600",
    background: "bg-white",
    border: "border-blue-200",
    selectedBorder: "border-purple",
  },
  WEEKEND: {
    icon: Sun,
    iconColor: "text-amber-600",
    background: "bg-amber-100",
    border: "border-amber-200",
    selectedBorder: "border-amber-500",
  },
  PUBLIC_HOLIDAY: {
    icon: Coffee,
    iconColor: "text-emerald-600",
    background: "bg-emerald-100",
    border: "border-emerald-200",
    selectedBorder: "border-emerald-500",
  },
  PERSONAL_LEAVE: {
    icon: Palmtree,
    iconColor: "text-rose-600",
    background: "bg-rose-100",
    border: "border-rose-200",
    selectedBorder: "border-rose-500",
  },
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEntryType(date: Date, entry?: DayEntry): EntryType {
  if (entry) return entry.entryType;
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6 ? "WEEKEND" : "WORKING_DAY";
}

function getEntryTypeLabel(entryType: EntryType): string {
  switch (entryType) {
    case "WORKING_DAY":
      return "Working day";
    case "WEEKEND":
      return "Weekend";
    case "PUBLIC_HOLIDAY":
      return "Public holiday";
    case "PERSONAL_LEAVE":
      return "Personal leave";
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function CalendarView() {
  const { entries, selectedDate, setSelectedDate } = useTaskContext();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(dateFromKey(selectedDate)),
  );

  const entriesByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  );

  const monthDates = useMemo(() => {
    const firstDay = startOfMonth(visibleMonth);
    const daysInMonth = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth() + 1,
      0,
    ).getDate();
    const dateCount =
      Math.ceil((firstDay.getDay() + daysInMonth) / WEEKDAYS.length) *
      WEEKDAYS.length;
    const gridStart = new Date(firstDay);
    gridStart.setDate(1 - firstDay.getDay());

    return Array.from({ length: dateCount }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const selectedEntry = entriesByDate.get(selectedDate);
  const selectedTasks = selectedEntry?.tasks ?? [];
  const selectedItems = selectedTasks.flatMap((task) => task.items ?? []);
  const selectedDateObject = dateFromKey(selectedDate);
  const selectedEntryType = getEntryType(selectedDateObject, selectedEntry);
  const selectedTypePresentation = ENTRY_TYPE_PRESENTATION[selectedEntryType];
  const SelectedTypeIcon = selectedTypePresentation.icon;

  const monthSummary = useMemo(() => {
    const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
    const monthEntries = entries.filter((entry) => entry.date.startsWith(`${monthKey}-`));
    const tasks = monthEntries.flatMap((entry) => entry.tasks ?? []);
    const items = tasks.flatMap((task) => task.items ?? []);
    return {
      daysWithTasks: monthEntries.filter((entry) => entry.tasks.length > 0).length,
      taskCount: tasks.length,
      completedCount: items.filter((item) => item.status === "COMPLETED").length,
      itemCount: items.length,
    };
  }, [entries, visibleMonth]);

  function shiftMonth(amount: number) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1,
    );
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  }

  function goToToday() {
    const today = toDateKey(new Date());
    setSelectedDate(today);
    setVisibleMonth(startOfMonth(dateFromKey(today)));
  }

  const monthTitle = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const todayKey = toDateKey(new Date());
  const plannedMinutes = selectedItems.reduce(
    (total, item) => total + (item.estimatedTimeMin ?? 0),
    0,
  );
  const trackedMinutes = selectedItems.reduce(
    (total, item) => total + (item.actualEffortMin ?? 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 text-[26px] font-bold leading-tight tracking-[-0.025em] text-ink">
            Calendar
          </h1>
          <p className="mb-0 mt-1.5 text-sm text-muted">
            See your daily tasks and progress at a glance.
          </p>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays size={17} />}
          iconClass="text-success"
          label="Days with tasks"
          value={monthSummary.daysWithTasks}
        />
        <SummaryCard
          icon={<ListTodo size={17} />}
          iconClass="text-info"
          label="Tasks this month"
          value={monthSummary.taskCount}
        />
        <SummaryCard
          icon={<CheckCircle2 size={17} />}
          iconClass="text-warning"
          label="Items completed"
          value={`${monthSummary.completedCount}/${monthSummary.itemCount}`}
        />
        <SummaryCard
          icon={<Clock3 size={17} />}
          iconClass="text-purple"
          label="Selected day planned"
          value={formatMinutes(plannedMinutes)}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <section
          aria-label={`${monthTitle} calendar`}
          className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2 className="m-0 text-lg font-semibold text-ink">{monthTitle}</h2>
              <p className="mb-0 mt-0.5 text-xs text-muted">
                Select a date to review its tasks.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="sr-only" htmlFor="calendar-month-picker">
                Choose calendar month
              </label>
              <input
                id="calendar-month-picker"
                type="month"
                value={`${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`}
                onChange={(event) => {
                  if (!event.target.value) return;
                  const nextMonth = startOfMonth(
                    new Date(`${event.target.value}-01T00:00:00`),
                  );
                  setVisibleMonth(nextMonth);
                  setSelectedDate(toDateKey(nextMonth));
                }}
                className="h-9 min-w-0 rounded-lg border border-purple-border bg-purple-subtle px-2.5 text-xs font-semibold text-purple outline-none transition-colors focus:border-purple focus:ring-2 focus:ring-purple/15"
              />
              <button
                type="button"
                onClick={goToToday}
                className="mr-1 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-purple-border hover:bg-purple-subtle hover:text-purple"
              >
                Today
              </button>
              <MonthButton label="Previous month" onClick={() => shiftMonth(-1)}>
                <ChevronLeft size={17} />
              </MonthButton>
              <MonthButton label="Next month" onClick={() => shiftMonth(1)}>
                <ChevronRight size={17} />
              </MonthButton>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-canvas-subtle">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-1 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted sm:px-2 sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 bg-canvas-subtle p-1">
            {monthDates.map((date) => {
              const dateKey = toDateKey(date);
              const entry = entriesByDate.get(dateKey);
              const tasks = entry?.tasks ?? [];
              const items = tasks.flatMap((task) => task.items ?? []);
              const completedCount = items.filter(
                (item) => item.status === "COMPLETED",
              ).length;
              const isCurrentMonth =
                date.getMonth() === visibleMonth.getMonth();
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;
              const entryType = getEntryType(date, entry);
              const entryPresentation = ENTRY_TYPE_PRESENTATION[entryType];
              const DateTypeIcon = entryPresentation.icon;
              const projectNames = [
                ...new Set(tasks.map((task) => task.project?.name ?? "Project")),
              ];
              const label = [
                date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                getEntryTypeLabel(entryType),
                `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`,
                items.length ? `${completedCount} of ${items.length} items complete` : "",
              ]
                .filter(Boolean)
                .join(". ");

              return (
                <button
                  type="button"
                  key={dateKey}
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedDate(dateKey);
                    if (!isCurrentMonth) setVisibleMonth(startOfMonth(date));
                  }}
                  className={`group flex min-h-[78px] min-w-0 flex-col items-stretch rounded-xl border p-1 text-left transition-colors sm:min-h-[112px] sm:p-1.5 ${
                    isSelected
                      ? entryType === "WORKING_DAY"
                        ? "border-purple bg-white ring-2 ring-inset ring-purple"
                        : `${entryPresentation.background} ${entryPresentation.selectedBorder} border-2`
                      : `${entryPresentation.background} ${entryPresentation.border} hover:brightness-[0.98]`
                  } ${!isCurrentMonth ? "opacity-45" : ""}`}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 ${
                        isToday && !isSelected
                          ? "bg-purple text-white"
                          : "text-ink-secondary"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </span>
                  {entryType !== "WORKING_DAY" && (
                    <span
                      className={`mt-1 inline-flex max-w-full items-center gap-1 self-start truncate rounded-md border px-1 py-0.5 text-[8px] font-semibold leading-tight sm:px-1.5 sm:text-[9px] ${entryPresentation.background} ${entryPresentation.border} ${entryPresentation.iconColor}`}
                      title={getEntryTypeLabel(entryType)}
                    >
                      <DateTypeIcon size={10} className="shrink-0" />
                      <span className="truncate">
                        {entryType === "PUBLIC_HOLIDAY"
                          ? "Holiday"
                          : getEntryTypeLabel(entryType)}
                      </span>
                    </span>
                  )}
                  {tasks.length > 0 ? (
                    <span className="mt-1 flex min-w-0 flex-col gap-0.5">
                      {projectNames.slice(0, 2).map((projectName) => (
                        <span
                          key={projectName}
                          title={projectName}
                          className="flex min-w-0 items-center gap-1 truncate text-[9px] font-medium leading-tight text-ink-secondary sm:text-[10px]"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple" />
                          <span className="truncate">{projectName}</span>
                        </span>
                      ))}
                      {projectNames.length > 2 && (
                        <span className="text-[9px] leading-tight text-muted">
                          +{projectNames.length - 2} more
                        </span>
                      )}
                      <span className="hidden items-center gap-1 text-[10px] text-muted sm:flex">
                        <CheckCircle2 size={11} className="text-success" />
                        {completedCount}/{items.length} items
                      </span>
                    </span>
                  ) : entryType === "WORKING_DAY" ? (
                    <span className="mt-1 hidden text-[10px] text-subtle sm:block">No tasks</span>
                  ) : null}
                  {items.length > 0 && (
                    <span className="mt-auto flex gap-0.5 pt-1" aria-hidden="true">
                      {items.slice(0, 12).map((item) => (
                        <span
                          key={item.id}
                          className={`h-1.5 flex-1 rounded-full ring-1 ring-inset ${
                            item.status === "COMPLETED"
                              ? "bg-success/35 ring-success/50"
                              : item.status === "IN_PROGRESS"
                                ? "bg-info/30 ring-info/45"
                                : "bg-slate-200 ring-slate-300"
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 text-[11px] text-muted sm:px-5">
            <Legend color="bg-success/35 ring-1 ring-success/50" label="Completed" />
            <Legend color="bg-info/30 ring-1 ring-info/45" label="In progress" />
            <Legend color="bg-slate-200 ring-1 ring-slate-300" label="Pending" />
            <Legend color="bg-amber-100 ring-1 ring-amber-200" label="Weekend" />
            <Legend color="bg-rose-100 ring-1 ring-rose-200" label="Leave" />
            <Legend color="bg-emerald-100 ring-1 ring-emerald-200" label="Holiday" />
            <span className="ml-auto">Dates are shown in your local timezone.</span>
          </div>
        </section>

        <aside className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xs">
          <div className="border-b border-line bg-canvas-subtle px-5 py-4">
            <p className="mb-1 text-xs font-medium text-muted">Selected day</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-0 text-lg font-semibold text-ink">
                {selectedDateObject.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-ink-secondary ${selectedTypePresentation.background} ${selectedTypePresentation.border}`}
              >
                <SelectedTypeIcon size={14} className={selectedTypePresentation.iconColor} />
                {getEntryTypeLabel(selectedEntryType)}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {selectedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-canvas-subtle px-4 py-7 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-subtle" />
                <p className="mb-1 mt-2 text-sm font-semibold text-ink">
                  Nothing scheduled
                </p>
                <p className="m-0 text-xs leading-relaxed text-muted">
                  There are no tasks recorded for this date yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((task) => {
                  const items = task.items ?? [];
                  return (
                    <article
                      key={task.id}
                      className="rounded-xl border border-line bg-white p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-wide text-purple">
                            {task.project?.name ?? "Project"}
                          </p>
                          <h3 className="m-0 text-sm font-semibold leading-snug text-ink">
                            {task.taskName}
                          </h3>
                        </div>
                      </div>
                      {items.length > 0 && (
                        <ul className="mb-0 mt-3 space-y-2 border-t border-line pt-3">
                          {items.slice(0, 4).map((item) => (
                            <li key={item.id} className="flex items-start gap-2 text-xs">
                              {item.status === "COMPLETED" ? (
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                              ) : (
                                <Circle
                                  size={14}
                                  className={`mt-0.5 shrink-0 ${
                                    item.status === "IN_PROGRESS"
                                      ? "text-info"
                                      : "text-warning"
                                  }`}
                                />
                              )}
                              <span
                                className={`min-w-0 flex-1 leading-relaxed ${
                                  item.status === "COMPLETED"
                                    ? "text-muted line-through"
                                    : "text-ink-secondary"
                                }`}
                              >
                                {item.description}
                              </span>
                            </li>
                          ))}
                          {items.length > 4 && (
                            <li className="pl-5 text-[11px] text-muted">
                              +{items.length - 4} more line items
                            </li>
                          )}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-muted">Planned / tracked</span>
              <span className="font-semibold text-ink">
                {formatMinutes(plannedMinutes)} / {formatMinutes(trackedMinutes)}
              </span>
            </div>
            <Link
              href="/tasks"
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-purple-border bg-purple-subtle px-4 text-sm font-semibold text-purple transition-colors hover:border-purple hover:bg-purple-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/15">
              <ListTodo size={16} />
              View tasks for this day
              <ChevronRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  iconClass,
  label,
  value,
}: {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-3.5 shadow-2xs sm:p-4">
      <div className={`flex items-center gap-2 ${iconClass}`}>
        {icon}
        <span className="text-[11px] font-medium text-muted sm:text-xs">{label}</span>
      </div>
      <p className="mb-0 mt-2 text-xl font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function MonthButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-secondary transition-colors hover:border-purple-border hover:bg-purple-subtle hover:text-purple"
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
