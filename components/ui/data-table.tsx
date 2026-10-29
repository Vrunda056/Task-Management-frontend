import type { ReactNode } from "react";

export interface Column<T> {
  /** Unique key for React reconciliation. */
  key: string;
  /** Header label. */
  header: string;
  /** Render the cell content for a given row. */
  render: (row: T) => ReactNode;
  /** Cell content alignment. */
  align?: "left" | "right" | "center";
  /** Extra classes applied to every `<td>` in this column. */
  className?: string;
  /** Extra classes applied to the `<th>`. */
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  /** Optional actions column rendered as the last column (right-aligned). */
  actions?: (row: T) => ReactNode;
  /** Header text for the actions column. */
  actionsHeader?: string;
  /** Set to `false` to suppress the hover background on rows. */
  hoverable?: boolean;
  className?: string;
}

const ALIGN_CLASSES: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Configurable table with typed columns and optional actions column.
 * Replaces the separate Users / Projects table implementations that shared
 * the same `table-container` + `projects-table` CSS structure.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  actions,
  actionsHeader = "Actions",
  hoverable = true,
  className = "",
}: DataTableProps<T>) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-purple-100/80 bg-card shadow-xs ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead className="border-b border-purple-100 bg-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3.5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#554b96] ${ALIGN_CLASSES[col.align ?? "left"]} ${col.headerClassName ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-3.5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-[#554b96]">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                className={`border-b border-[#f1eff7] transition-all last:border-b-0 ${
                  hoverable
                    ? "hover:shadow-[inset_3px_0_0_0_#6958d8]"
                    : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3.5 py-4 text-sm align-middle ${ALIGN_CLASSES[col.align ?? "left"]} ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-3.5 py-4 text-sm align-middle">
                    <div className="flex justify-end gap-1.5">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
