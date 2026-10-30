import type { ReactNode } from "react";

export interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Filter / control toolbar wrapper with consistent styling.
 * Replaces the repeated `<div className="flex flex-col md:flex-row ... p-3 rounded-xl border border-line bg-card shadow-xs">` markup.
 */
export function Toolbar({ children, className = "" }: ToolbarProps) {
  return (
    <div
      className={`mb-6 flex flex-col items-stretch gap-3 rounded-xl border border-purple-200/70 bg-white p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      {children}
    </div>
  );
}
