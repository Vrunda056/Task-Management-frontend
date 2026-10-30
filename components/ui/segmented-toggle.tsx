import type { ReactNode } from "react";

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label?: string;
  icon?: ReactNode;
  title?: string;
}

export interface SegmentedToggleProps<T extends string> {
  value: T;
  options: SegmentedToggleOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented toggle for view-mode switching (table/grid, list/kanban, etc.).
 * Replaces the repeated inline segmented-control markup in Users and Tasks pages.
 */
export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={`inline-flex h-9 items-center gap-1 rounded-lg border border-purple-200/70 bg-white p-1 shadow-2xs ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          aria-label={opt.title ?? opt.label}
          className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold outline-none focus:outline-none focus-visible:outline-none transition-all ${
            value === opt.value
              ? "bg-purple text-white shadow-xs"
              : "bg-transparent text-ink-secondary hover:bg-purple-subtle/60 hover:text-purple"
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          {opt.label && <span>{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}
