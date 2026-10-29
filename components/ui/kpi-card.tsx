import type { ReactNode } from "react";

export type KpiIconVariant = "violet" | "blue" | "green" | "orange";

const ICON_CLASSES: Record<KpiIconVariant, string> = {
  violet: "bg-[#f0edff] text-[#7462d3]",
  blue: "bg-[#eaf2ff] text-[#5c86d1]",
  green: "bg-[#e7f7ef] text-[#48a27b]",
  orange: "bg-[#fff1e6] text-[#df9258]",
};

export interface KpiCardProps {
  icon: ReactNode;
  iconVariant?: KpiIconVariant;
  label: string;
  value: string | number;
  trend?: {
    text: string;
    type: "positive" | "neutral";
  };
  footnote?: string;
  className?: string;
}

/**
 * KPI / stat card with icon, value, trend, and footnote.
 * Replaces the duplicated `stat-card` markup on the dashboard.
 */
export function KpiCard({
  icon,
  iconVariant = "violet",
  label,
  value,
  trend,
  footnote,
  className = "",
}: KpiCardProps) {
  return (
    <article
      className={`min-h-[136px] rounded-xl border border-purple-100/90 bg-white p-4 shadow-[0_2px_8px_rgba(105,88,216,0.04)] transition-all hover:border-purple-200 hover:shadow-[0_4px_16px_rgba(105,88,216,0.08)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid h-[32px] w-[32px] place-items-center rounded-lg text-sm shadow-2xs ${ICON_CLASSES[iconVariant]}`}
        >
          {icon}
        </span>
        {trend && (
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
              trend.type === "positive"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>
      <p className="mt-3 mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-muted">
        {label}
      </p>
      <p className="m-0 text-2xl font-bold tracking-[-0.02em] text-ink">{value}</p>
      {footnote && <p className="mt-1 m-0 text-xs font-normal text-muted">{footnote}</p>}
    </article>
  );
}
