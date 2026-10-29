// Barrel export for all shared UI components.

export { Avatar, getAvatarVariant, getInitials, type AvatarProps, type AvatarVariant } from "./avatar";
export { StatusBadge, type BadgeVariant, type StatusBadgeProps } from "./status-badge";
export {
  Button,
  ActionButton,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ActionButtonProps,
  type ActionVariant,
} from "./button";
export {
  LoadingState,
  ErrorState,
  EmptyState,
  QueryState,
  type LoadingStateProps,
  type ErrorStateProps,
  type EmptyStateProps,
  type QueryStateProps,
} from "./states";
export { PageHeader, type PageHeaderProps } from "./page-header";
export { SearchInput, type SearchInputProps } from "./search-input";
export { FilterSelect, type FilterSelectProps } from "./filter-select";
export {
  SegmentedToggle,
  type SegmentedToggleOption,
  type SegmentedToggleProps,
} from "./segmented-toggle";
export { DataTable, type Column, type DataTableProps } from "./data-table";
export {
  Modal,
  ModalBody,
  ModalFooter,
  type ModalProps,
} from "./modal";
export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
export { KpiCard, type KpiCardProps, type KpiIconVariant } from "./kpi-card";
export { Pagination, type PaginationProps } from "./pagination";
export { useToast, Toast, type ToastState, type ToastProps } from "./toast";
export { Toolbar, type ToolbarProps } from "./toolbar";
