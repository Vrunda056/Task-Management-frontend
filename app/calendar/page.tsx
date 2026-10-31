import type { Metadata } from "next";
import { CalendarView } from "./calendar-view";

export const metadata: Metadata = {
  title: "Calendar | Taskly",
  description: "View your daily tasks and progress across the calendar.",
};

export default function CalendarPage() {
  return <CalendarView />;
}
