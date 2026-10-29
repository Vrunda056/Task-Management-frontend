import type { SelectHTMLAttributes } from "react";

export interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

/**
 * Styled select for filter dropdowns in toolbars.
 * Replaces the ad-hoc `modal-input` / custom Tailwind select pattern.
 */
export function FilterSelect({
  className = "",
  children,
  ...rest
}: FilterSelectProps) {
  return (
    <select
      className={`h-9 cursor-pointer rounded-lg border border-purple-200/70 bg-white px-3 text-xs font-medium text-ink shadow-2xs outline-none transition-all hover:border-purple focus:border-purple focus:ring-2 focus:ring-purple/15 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
