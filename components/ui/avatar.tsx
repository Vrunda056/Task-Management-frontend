"use client";

import { useMemo } from "react";

const AVATAR_VARIANTS = ["lavender", "peach", "mint", "sky"] as const;
export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

const VARIANT_CLASSES: Record<AvatarVariant, string> = {
  lavender: "bg-[#eee9ff] text-[#6c56c8]",
  peach: "bg-[#ffe9df] text-[#b76d4d]",
  mint: "bg-[#e1f4ec] text-[#408a6b]",
  sky: "bg-[#e1efff] text-[#4878b0]",
};

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

/** Deterministically picks an avatar colour variant from a name. */
export function getAvatarVariant(name: string): AvatarVariant {
  if (!name) return AVATAR_VARIANTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_VARIANTS[Math.abs(hash) % AVATAR_VARIANTS.length];
}

/** Returns up to two uppercase initials from a full name. */
export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps {
  name: string;
  /** Preset size — override with `className` for bespoke sizes. */
  size?: keyof typeof SIZE_CLASSES;
  /** Override the computed variant when a fixed colour is needed. */
  variant?: AvatarVariant;
  className?: string;
}

/**
 * Circular avatar with deterministic colour and initials.
 * Replaces the repeated `getAvatarVariant` + `getInitials` + `<span class="avatar">` pattern.
 */
export function Avatar({ name, size = "sm", variant, className = "" }: AvatarProps) {
  const resolvedVariant = useMemo(
    () => variant ?? getAvatarVariant(name),
    [name, variant],
  );
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold ${VARIANT_CLASSES[resolvedVariant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
