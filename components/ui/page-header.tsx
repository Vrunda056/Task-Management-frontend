import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Reusable page heading with optional action buttons.
 * Replaces the duplicated `projects-header` / `projects-title` pattern.
 */
export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <header
      className={`mb-7 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5 ${className}`}
    >
      <div>
        <h1 className="m-0 text-[26px] font-bold leading-[1.2] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 m-0 text-sm font-normal leading-[1.45] text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
