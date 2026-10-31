import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "brand" | "amber";
export type ButtonSize = "sm" | "md";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border border-purple bg-purple text-white hover:bg-purple-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(105,88,216,0.25)] active:translate-y-0",
  secondary:
    "border border-slate-300 bg-white text-ink hover:border-black hover:text-black hover:bg-slate-50 active:bg-slate-100",
  danger:
    "border border-danger-border bg-danger-bg text-danger hover:bg-danger-border/30 hover:border-danger",
  brand:
    "border border-purple bg-purple text-white hover:bg-purple-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(105,88,216,0.25)] active:translate-y-0",
  amber:
    "border border-amber-600 bg-amber-600 text-white hover:bg-amber-700 hover:border-amber-700 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(217,119,6,0.25)] active:translate-y-0",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 min-h-8 rounded-md px-3 text-xs",
  md: "min-h-[38px] rounded-lg px-4 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

/**
 * Reusable button with primary / secondary / danger variants.
 * Unifies the `btn btn-primary`, `btn btn-secondary`, and `primary-button` CSS patterns.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ActionButton — compact icon buttons for table rows and card toolbars
// ---------------------------------------------------------------------------

export type ActionVariant = "default" | "edit" | "delete";

const ACTION_BASE =
  "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold cursor-pointer transition-all hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs";

const ACTION_VARIANT_CLASSES: Record<ActionVariant, string> = {
  default:
    "border-purple-200 bg-purple-50/90 text-purple hover:bg-purple-100 hover:border-purple-300 hover:text-purple-hover hover:shadow-[0_2px_8px_rgba(105,88,216,0.18)] active:bg-purple-200",
  edit:
    "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm active:bg-zinc-100",
  delete:
    "border-rose-200 bg-rose-50/90 text-rose-600 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 hover:shadow-[0_2px_8px_rgba(225,29,72,0.18)] active:bg-rose-200",
};

export interface ActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  variant?: ActionVariant;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Compact icon button for row actions (edit, delete) and card toolbars.
 * Replaces the `action-btn action-edit` / `action-btn action-delete` CSS pattern.
 */
export function ActionButton({
  icon,
  onClick,
  title,
  variant = "default",
  disabled = false,
  label,
  className = "",
}: ActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`${ACTION_BASE} ${ACTION_VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
