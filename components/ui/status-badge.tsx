import type { ReactNode } from "react";

export type BadgeVariant = "green" | "blue" | "amber" | "yellow" | "gray";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green: "bg-success-bg text-success border-success-border",
  blue: "bg-info-bg text-info border-info-border",
  amber: "bg-warning-bg text-warning border-warning-border",
  yellow: "bg-[#fefce8] text-[#a16207] border-[#fef08a]",
  gray: "bg-slate-50 text-slate-700 border-slate-200 shadow-2xs",
};

export interface StatusBadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

/**
 * Compact status pill used in tables, cards, and dashboards.
 * Replaces the repeated `status-pill status-{colour}` CSS pattern.
 */
export function StatusBadge({ variant, children, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase leading-[1.3] tracking-[0.03em] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
