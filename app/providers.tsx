"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const queryClient = new QueryClient();

import { TaskProvider } from "@/lib/tasks/task-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        {children}
      </TaskProvider>
    </QueryClientProvider>
  );
}
