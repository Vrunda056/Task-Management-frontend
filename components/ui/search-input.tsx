import { Search, X } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Height in px — default 36. */
  height?: number;
}

/**
 * Search input with leading icon and clear button.
 * Replaces the duplicated search-box / search pattern across Users and Tasks pages.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  height = 36,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple/60"
        aria-hidden="true"
      />
      <input
        type="text"
        className={`w-full rounded-lg border border-purple-200/70 bg-white text-xs text-ink outline-none transition-all hover:border-purple focus:border-purple focus:ring-2 focus:ring-purple/15 ${height === 36 ? "h-9" : ""} pl-9 pr-8 shadow-2xs placeholder:text-muted`}
        style={height !== 36 ? { height: `${height}px` } : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
