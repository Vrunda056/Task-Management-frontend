"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { TaskProvider } from "@/lib/tasks/task-context";
import { ToastProvider, showGlobalToast } from "@/components/ui/toast";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Skip if the mutation explicitly asked to handle errors locally
      if (mutation.meta?.suppressToast) return;
      showGlobalToast(error.message || "An unexpected error occurred", "error");
    },
  }),
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <TaskProvider>{children}</TaskProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

