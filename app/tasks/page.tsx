import { TaskManagement } from "./task-management";

export const metadata = {
  title: "My Tasks & Time Tracker | Taskly",
  description: "Track daily tasks, estimate line items, and run live timers to monitor completion time.",
};

export default function TasksPage() {
  return <TaskManagement />;
}
