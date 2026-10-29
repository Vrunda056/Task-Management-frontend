"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Simple prev/next pagination control with page indicator.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={`flex items-center justify-between border-t border-[#f4f3f6] px-3 py-3 text-xs text-muted ${className}`}
    >
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-[#d4d2df] bg-[#f8f7fb] px-2.5 text-xs font-semibold text-ink transition-all hover:bg-[#f0eef6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-[#d4d2df] bg-[#f8f7fb] px-2.5 text-xs font-semibold text-ink transition-all hover:bg-[#f0eef6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
