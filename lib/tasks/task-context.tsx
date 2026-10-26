"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type {
  ActiveTimer,
  CreateTaskInput,
  DayEntry,
  EntryType,
  Task,
  TaskItem,
  TaskItemStatus,
} from "./task.schema";
import { useProjects } from "../projects/use-project";

const STORAGE_KEY_ENTRIES = "taskly_day_entries_v2";
const STORAGE_KEY_TIMER = "taskly_active_timer_v2";

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultSeedEntries(todayDate: string): DayEntry[] {
  return [
    {
      id: "day-today",
      date: todayDate,
      entryType: "WORKING_DAY",
      userId: "user-default-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: "task-1",
          taskName: "Core Analytics Changes",
          dayEntryId: "day-today",
          projectId: "project-1",
          project: {
            id: "project-1",
            name: "Website redesign",
            description: "Modernizing core customer workflows",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            {
              id: "item-1-1",
              description: "Refactor telemetry pipeline for dashboard events",
              estimatedTimeMin: 45,
              actualEffortMin: 40,
              status: "COMPLETED",
              note: "Completed ahead of schedule. PR #104 merged.",
              taskId: "task-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "item-1-2",
              description: "Implement real-time session duration tracking",
              estimatedTimeMin: 60,
              actualEffortMin: 35,
              status: "IN_PROGRESS",
              note: "Timer currently active for tracking completion.",
              taskId: "task-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "item-1-3",
              description: "Write unit test suite for analytics hook edge cases",
              estimatedTimeMin: 30,
              actualEffortMin: null,
              status: "PENDING",
              note: null,
              taskId: "task-1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: "task-2",
          taskName: "DEV Server & CI Pipeline",
          dayEntryId: "day-today",
          projectId: "project-2",
          project: {
            id: "project-2",
            name: "Internal Platform",
            description: "Infrastructure and dev environments",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            {
              id: "item-2-1",
              description: "Configure Docker compose for staging PostgreSQL",
              estimatedTimeMin: 90,
              actualEffortMin: 105,
              status: "COMPLETED",
              note: "Delayed 15m resolving port conflict with local daemon.",
              taskId: "task-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "item-2-2",
              description: "Verify Prisma schema migrations and health checks",
              estimatedTimeMin: 40,
              actualEffortMin: null,
              status: "PENDING",
              note: null,
              taskId: "task-2",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    },
  ];
}

interface TaskContextType {
  entries: DayEntry[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentDayEntry: DayEntry | null;
  activeTimer: ActiveTimer | null;
  // Timer Actions
  startTimer: (
    task: Task,
    item: TaskItem,
    options?: { mode?: "stopwatch" | "countdown"; targetMinutes?: number }
  ) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (saveToEffort?: boolean, markCompleted?: boolean, note?: string) => void;
  resetTimer: () => void;
  extendTimer: (additionalMinutes: number) => void;
  // Tasks CRUD
  createTask: (input: CreateTaskInput) => void;
  updateTaskName: (taskId: string, newTaskName: string) => void;
  deleteTask: (taskId: string) => void;
  // Task Items CRUD
  addTaskItem: (
    taskId: string,
    data: { description: string; estimatedTimeMin?: number | null; note?: string | null }
  ) => void;
  updateTaskItem: (
    taskItemId: string,
    updates: Partial<{
      description: string;
      estimatedTimeMin: number | null;
      actualEffortMin: number | null;
      status: TaskItemStatus;
      note: string | null;
    }>
  ) => void;
  deleteTaskItem: (taskItemId: string) => void;
  logManualTime: (taskItemId: string, minutes: number, note?: string) => void;
  // Day Entry Type
  updateDayEntryType: (date: string, type: EntryType) => void;
  // Stats
  dayStats: {
    totalEstimatedMin: number;
    totalActualMin: number;
    completedItemsCount: number;
    totalItemsCount: number;
    inProgressItemsCount: number;
    pendingItemsCount: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function getStoredEntries(): DayEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (stored) {
      return JSON.parse(stored);
    }
    return createDefaultSeedEntries(getTodayDateString());
  } catch (error) {
    console.error("Failed to load entries from localStorage", error);
    return createDefaultSeedEntries(getTodayDateString());
  }
}

function getStoredTimer(): ActiveTimer | null {
  try {
    const storedTimer = localStorage.getItem(STORAGE_KEY_TIMER);
    if (!storedTimer) return null;
    const parsed: ActiveTimer = JSON.parse(storedTimer);
    if (parsed.isRunning && parsed.startedAt) {
      const now = Date.now();
      const passedSec = Math.floor((now - parsed.startedAt) / 1000);
      if (parsed.mode === "countdown") {
        const newLeft = Math.max(0, parsed.secondsLeft - passedSec);
        parsed.secondsLeft = newLeft;
        parsed.elapsedSeconds += passedSec;
        if (newLeft === 0) parsed.isRunning = false;
      } else {
        parsed.elapsedSeconds += passedSec;
      }
      parsed.startedAt = now;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to load timer from localStorage", error);
    return null;
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [entries, setEntries] = useState<DayEntry[]>(() =>
    createDefaultSeedEntries(getTodayDateString())
  );
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const projectsQuery = useProjects();

  useEffect(() => {
    let isCancelled = false;
    queueMicrotask(() => {
      if (isCancelled) return;
      setEntries(getStoredEntries());
      setActiveTimer(getStoredTimer());
      setIsHydrated(true);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Persist entries on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries to localStorage", e);
    }
  }, [entries, isHydrated]);

  // Persist timer on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (activeTimer) {
        localStorage.setItem(STORAGE_KEY_TIMER, JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem(STORAGE_KEY_TIMER);
      }
    } catch (e) {
      console.error("Failed to save timer to localStorage", e);
    }
  }, [activeTimer, isHydrated]);

  const isTimerRunning = activeTimer?.isRunning;

  // Timer interval ticker
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;

        if (prev.mode === "countdown") {
          const nextSecondsLeft = prev.secondsLeft - 1;
          const nextElapsed = prev.elapsedSeconds + 1;

          if (nextSecondsLeft <= 0) {
            // Beep alert or notification if available
            try {
              if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification("Timer Completed! 🎯", {
                    body: `Your timer for "${prev.itemDescription}" has finished.`,
                  });
                }
              }
            } catch {
              // ignore
            }

            return {
              ...prev,
              secondsLeft: 0,
              elapsedSeconds: nextElapsed,
              isRunning: false,
            };
          }

          return {
            ...prev,
            secondsLeft: nextSecondsLeft,
            elapsedSeconds: nextElapsed,
          };
        } else {
          // Stopwatch
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Current DayEntry
  const currentDayEntry = useMemo(() => {
    const found = entries.find((e) => e.date === selectedDate);
    if (found) return found;

    // Return a virtual entry if not saved yet
    const now = new Date();
    const selDate = new Date(selectedDate);
    const dayOfWeek = selDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
      id: `day-${selectedDate}`,
      date: selectedDate,
      entryType: isWeekend ? "WEEKEND" : "WORKING_DAY",
      userId: "user-default-1",
      tasks: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } as DayEntry;
  }, [entries, selectedDate]);

  // Stats calculation
  const dayStats = useMemo(() => {
    let totalEstimatedMin = 0;
    let totalActualMin = 0;
    let completedItemsCount = 0;
    let inProgressItemsCount = 0;
    let pendingItemsCount = 0;
    let totalItemsCount = 0;

    if (currentDayEntry && currentDayEntry.tasks) {
      for (const t of currentDayEntry.tasks) {
        for (const item of t.items) {
          totalItemsCount++;
          if (item.estimatedTimeMin) totalEstimatedMin += item.estimatedTimeMin;
          if (item.actualEffortMin) totalActualMin += item.actualEffortMin;

          if (item.status === "COMPLETED") completedItemsCount++;
          else if (item.status === "IN_PROGRESS") inProgressItemsCount++;
          else pendingItemsCount++;
        }
      }
    }

    return {
      totalEstimatedMin,
      totalActualMin,
      completedItemsCount,
      totalItemsCount,
      inProgressItemsCount,
      pendingItemsCount,
    };
  }, [currentDayEntry]);

  // Timer actions
  const startTimer = useCallback(
    (
      task: Task,
      item: TaskItem,
      options?: { mode?: "stopwatch" | "countdown"; targetMinutes?: number }
    ) => {
      const mode = options?.mode ?? "stopwatch";
      const targetMin = options?.targetMinutes ?? item.estimatedTimeMin ?? 25;
      const initialTargetSeconds = targetMin * 60;

      // Automatically move status to IN_PROGRESS
      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.map((t) => ({
            ...t,
            items: t.items.map((it) => {
              if (it.id === item.id && it.status !== "COMPLETED") {
                return { ...it, status: "IN_PROGRESS", updatedAt: new Date().toISOString() };
              }
              return it;
            }),
          })),
        }))
      );

      const projectName =
        task.project?.name ||
        projectsQuery.data?.find((p) => p.id === task.projectId)?.name ||
        "Project";

      setActiveTimer({
        taskId: task.id,
        taskItemId: item.id,
        taskName: task.taskName,
        itemDescription: item.description,
        projectName,
        mode,
        initialTargetSeconds,
        secondsLeft: initialTargetSeconds,
        elapsedSeconds: (item.actualEffortMin ?? 0) * 60,
        isRunning: true,
        startedAt: Date.now(),
        estimatedTimeMin: item.estimatedTimeMin,
      });

      // Request browser notification permission if not yet decided
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    },
    [projectsQuery.data]
  );

  const pauseTimer = useCallback(() => {
    setActiveTimer((prev) => (prev ? { ...prev, isRunning: false } : null));
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveTimer((prev) =>
      prev ? { ...prev, isRunning: true, startedAt: Date.now() } : null
    );
  }, []);

  const stopTimer = useCallback(
    (saveToEffort = true, markCompleted = false, note?: string) => {
      if (!activeTimer) return;

      const elapsedMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));

      if (saveToEffort) {
        setEntries((prev) =>
          prev.map((day) => ({
            ...day,
            tasks: day.tasks.map((t) => ({
              ...t,
              items: t.items.map((it) => {
                if (it.id === activeTimer.taskItemId) {
                  return {
                    ...it,
                    actualEffortMin: elapsedMinutes,
                    status: markCompleted ? "COMPLETED" : it.status,
                    note: note !== undefined ? note : it.note,
                    updatedAt: new Date().toISOString(),
                  };
                }
                return it;
              }),
            })),
          }))
        );
      }

      setActiveTimer(null);
    },
    [activeTimer]
  );

  const resetTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        elapsedSeconds: 0,
        secondsLeft: prev.initialTargetSeconds,
        isRunning: false,
      };
    });
  }, []);

  const extendTimer = useCallback((additionalMinutes: number) => {
    setActiveTimer((prev) => {
      if (!prev) return null;
      const extraSec = additionalMinutes * 60;
      return {
        ...prev,
        secondsLeft: prev.secondsLeft + extraSec,
        initialTargetSeconds: prev.initialTargetSeconds + extraSec,
        isRunning: true,
      };
    });
  }, []);

  // Task CRUD
  const createTask = useCallback(
    (input: CreateTaskInput) => {
      const now = new Date().toISOString();
      const newTaskId = `task-${Date.now()}`;
      const projectName =
        projectsQuery.data?.find((p) => p.id === input.projectId)?.name || "Selected Project";

      const newTask: Task = {
        id: newTaskId,
        taskName: input.taskName,
        dayEntryId: `day-${input.date}`,
        projectId: input.projectId,
        project: {
          id: input.projectId,
          name: projectName,
        },
        createdAt: now,
        updatedAt: now,
        items: input.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          description: it.description,
          estimatedTimeMin: it.estimatedTimeMin ?? null,
          actualEffortMin: null,
          status: "PENDING" as TaskItemStatus,
          note: it.note ?? null,
          taskId: newTaskId,
          createdAt: now,
          updatedAt: now,
        })),
      };

      setEntries((prev) => {
        const existingDayIndex = prev.findIndex((e) => e.date === input.date);
        if (existingDayIndex >= 0) {
          const updated = [...prev];
          updated[existingDayIndex] = {
            ...updated[existingDayIndex],
            tasks: [newTask, ...updated[existingDayIndex].tasks],
            updatedAt: now,
          };
          return updated;
        } else {
          const newDay: DayEntry = {
            id: `day-${input.date}`,
            date: input.date,
            entryType: "WORKING_DAY",
            userId: "user-default-1",
            createdAt: now,
            updatedAt: now,
            tasks: [newTask],
          };
          return [newDay, ...prev];
        }
      });
    },
    [projectsQuery.data]
  );

  const updateTaskName = useCallback((taskId: string, newTaskName: string) => {
    setEntries((prev) =>
      prev.map((day) => ({
        ...day,
        tasks: day.tasks.map((t) => (t.id === taskId ? { ...t, taskName: newTaskName } : t)),
      }))
    );
  }, []);

  const deleteTask = useCallback(
    (taskId: string) => {
      if (activeTimer?.taskId === taskId) {
        setActiveTimer(null);
      }
      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.filter((t) => t.id !== taskId),
        }))
      );
    },
    [activeTimer]
  );

  // Task Items CRUD
  const addTaskItem = useCallback(
    (
      taskId: string,
      data: { description: string; estimatedTimeMin?: number | null; note?: string | null }
    ) => {
      const now = new Date().toISOString();
      const newItem: TaskItem = {
        id: `item-${Date.now()}`,
        description: data.description,
        estimatedTimeMin: data.estimatedTimeMin ?? null,
        actualEffortMin: null,
        status: "PENDING",
        note: data.note ?? null,
        taskId,
        createdAt: now,
        updatedAt: now,
      };

      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.map((t) => {
            if (t.id === taskId) {
              return { ...t, items: [...t.items, newItem] };
            }
            return t;
          }),
        }))
      );
    },
    []
  );

  const updateTaskItem = useCallback(
    (
      taskItemId: string,
      updates: Partial<{
        description: string;
        estimatedTimeMin: number | null;
        actualEffortMin: number | null;
        status: TaskItemStatus;
        note: string | null;
      }>
    ) => {
      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.map((t) => ({
            ...t,
            items: t.items.map((it) => {
              if (it.id === taskItemId) {
                return {
                  ...it,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                };
              }
              return it;
            }),
          })),
        }))
      );

      // If this item is currently running and status changed to COMPLETED
      if (activeTimer?.taskItemId === taskItemId && updates.status === "COMPLETED") {
        setActiveTimer(null);
      }
    },
    [activeTimer]
  );

  const deleteTaskItem = useCallback(
    (taskItemId: string) => {
      if (activeTimer?.taskItemId === taskItemId) {
        setActiveTimer(null);
      }
      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.map((t) => ({
            ...t,
            items: t.items.filter((it) => it.id !== taskItemId),
          })),
        }))
      );
    },
    [activeTimer]
  );

  const logManualTime = useCallback(
    (taskItemId: string, minutes: number, note?: string) => {
      setEntries((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: day.tasks.map((t) => ({
            ...t,
            items: t.items.map((it) => {
              if (it.id === taskItemId) {
                return {
                  ...it,
                  actualEffortMin: Math.max(0, minutes),
                  note: note !== undefined ? note : it.note,
                  updatedAt: new Date().toISOString(),
                };
              }
              return it;
            }),
          })),
        }))
      );
    },
    []
  );

  const updateDayEntryType = useCallback(
    (date: string, type: EntryType) => {
      setEntries((prev) => {
        const existing = prev.find((e) => e.date === date);
        if (existing) {
          return prev.map((e) =>
            e.date === date
              ? { ...e, entryType: type, updatedAt: new Date().toISOString() }
              : e
          );
        } else {
          const newEntry: DayEntry = {
            id: `day-${date}`,
            date,
            entryType: type,
            userId: "user-default-1",
            tasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [newEntry, ...prev];
        }
      });
    },
    []
  );

  return (
    <TaskContext.Provider
      value={{
        entries,
        selectedDate,
        setSelectedDate,
        currentDayEntry,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        extendTimer,
        createTask,
        updateTaskName,
        deleteTask,
        addTaskItem,
        updateTaskItem,
        deleteTaskItem,
        logManualTime,
        updateDayEntryType,
        dayStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
