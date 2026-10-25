import { z } from "zod";

export const EntryTypeEnum = z.enum([
  "WORKING_DAY",
  "WEEKEND",
  "PUBLIC_HOLIDAY",
  "PERSONAL_LEAVE",
]);
export type EntryType = z.infer<typeof EntryTypeEnum>;

export const TaskItemStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);
export type TaskItemStatus = z.infer<typeof TaskItemStatusEnum>;

export interface TaskItem {
  id: string;
  description: string;
  estimatedTimeMin: number | null;
  actualEffortMin: number | null;
  status: TaskItemStatus;
  note: string | null;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskName: string;
  dayEntryId: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    description?: string | null;
  };
  items: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DayEntry {
  id: string;
  date: string; // YYYY-MM-DD
  entryType: EntryType;
  label?: string | null;
  userId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ActiveTimer {
  taskId: string;
  taskItemId: string;
  taskName: string;
  itemDescription: string;
  projectName: string;
  mode: "stopwatch" | "countdown";
  initialTargetSeconds: number; // e.g. 25 * 60 for 25 min pomodoro, or 0 for stopwatch
  secondsLeft: number; // For countdown
  elapsedSeconds: number; // For stopwatch or elapsed tracking
  isRunning: boolean;
  startedAt: number; // Timestamp
  estimatedTimeMin: number | null;
}

export const createTaskItemSchema = z.object({
  description: z.string().trim().min(2, "Description must be at least 2 characters").max(500),
  estimatedTimeMin: z.number().int().min(0, "Estimated time cannot be negative").nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
});

export const createTaskSchema = z.object({
  taskName: z.string().trim().min(2, "Task name must be at least 2 characters").max(100),
  projectId: z.string().min(1, "Please select a project"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  items: z.array(createTaskItemSchema).min(1, "Add at least one item/line description"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
