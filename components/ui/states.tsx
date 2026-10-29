import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// LoadingState
// ---------------------------------------------------------------------------

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

/** Full-panel loading spinner with message. Replaces the `page-state` CSS block. */
export function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
  return (
    <div
      className={`grid min-h-[320px] place-items-center gap-3 rounded-[10px] border border-line bg-white p-10 text-center ${className}`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#f0eff4] border-t-purple" />
      <p className="m-0 text-sm font-medium text-muted">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorState
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

/** Error banner with icon. Replaces the `page-error` CSS block. */
export function ErrorState({
  title = "Something went wrong",
  message,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-lg border border-danger-border bg-danger-bg p-4 ${className}`}
    >
      <span className="text-xl text-danger">⚠</span>
      <div>
        <h3 className="m-0 mb-0.5 text-sm font-semibold text-danger">{title}</h3>
        <p className="m-0 text-xs text-danger-hover">{message}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

/** Empty-state panel. Replaces the `page-empty` CSS block. */
export function EmptyState({
  icon = "📭",
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`grid min-h-[320px] place-items-center gap-3 rounded-[10px] border border-line bg-white p-10 text-center ${className}`}
    >
      <div className="text-[2.5rem] opacity-50">{icon}</div>
      <h3 className="m-0 text-sm font-semibold text-ink">{title}</h3>
      {message && <p className="m-0 text-sm text-muted">{message}</p>}
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QueryState — convenience wrapper that picks loading / error / empty / data
// ---------------------------------------------------------------------------

export interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty: boolean;
  loadingMessage?: string;
  errorTitle?: string;
  emptyIcon?: string;
  emptyTitle: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children?: ReactNode;
  /** Rendered only when NOT loading, NOT error, NOT empty. */
  data?: ReactNode;
}

/**
 * Declaratively renders the correct state panel for a React Query result.
 * Pass `data` for the success view, or use `children`.
 */
export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  loadingMessage,
  errorTitle,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  data,
  children,
}: QueryStateProps) {
  if (isLoading) return <LoadingState message={loadingMessage} />;
  if (isError) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return <ErrorState title={errorTitle} message={msg} />;
  }
  if (isEmpty)
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  return <>{data ?? children}</>;
}
