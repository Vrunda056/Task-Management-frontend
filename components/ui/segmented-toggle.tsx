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
  /** Active segment colour theme — "gray" (default) or "purple". */
  activeTheme?: "gray" | "purple" | "neutral";
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
  activeTheme = "gray",
}: SegmentedToggleProps<T>) {
  const isPurple = activeTheme === "purple";

  const containerClass = isPurple
    ? "border-purple-200/70 bg-[#faf8ff]"
    : "border-zinc-300/80 bg-zinc-100";

  const activeClass = isPurple
    ? "bg-purple text-white shadow-xs font-semibold"
    : "bg-zinc-800 text-white shadow-xs font-semibold";

  const inactiveClass = isPurple
    ? "bg-transparent text-[#665a9e] hover:bg-white hover:text-purple"
    : "bg-transparent text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border p-1 shadow-2xs ${containerClass} ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          aria-label={opt.title ?? opt.label}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold outline-none focus:outline-none focus-visible:outline-none transition-all ${
            value === opt.value ? activeClass : inactiveClass
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
