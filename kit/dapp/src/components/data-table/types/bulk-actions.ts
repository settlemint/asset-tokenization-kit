/**
 * Type definitions for bulk actions in data tables
 */

import type { LucideIcon } from "lucide-react";

export interface BulkActionContext<TData = unknown> {
  selectedRows: TData[];
  selectedRowIds: string[];
  table: unknown; // Will be properly typed when used
  onComplete: () => void;
  onError: (error: Error) => void;
}

export interface BulkAction<TData = unknown> {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive" | "secondary" | "outline";
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  confirmationAction?: string;
  disabled?: boolean | ((context: BulkActionContext<TData>) => boolean);
  hidden?: boolean | ((context: BulkActionContext<TData>) => boolean);
  execute: (context: BulkActionContext<TData>) => Promise<void> | void;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface BulkActionGroup<TData = unknown> {
  id: string;
  label?: string;
  actions: BulkAction<TData>[];
  separator?: boolean;
}

export interface BulkActionBarState {
  isVisible: boolean;
  selectedCount: number;
  isLoading: boolean;
  currentAction?: string;
}

export interface BulkActionBarProps<TData = unknown> {
  selectedRowIds: string[];
  selectedRows: TData[];
  table: unknown;
  actions?: BulkAction<TData>[];
  actionGroups?: BulkActionGroup<TData>[];
  onSelectionClear: () => void;
  position?: "bottom" | "top";
  className?: string;
  showSelectionCount?: boolean;
  enableSelectAll?: boolean;
  maxHeight?: string;
}

export interface CommonBulkActions {
  EXPORT: "export";
  DELETE: "delete";
  ARCHIVE: "archive";
  DUPLICATE: "duplicate";
  UPDATE_STATUS: "update-status";
  ASSIGN: "assign";
  TAG: "tag";
  MOVE: "move";
}

export const COMMON_BULK_ACTION_IDS: CommonBulkActions = {
  EXPORT: "export",
  DELETE: "delete",
  ARCHIVE: "archive",
  DUPLICATE: "duplicate",
  UPDATE_STATUS: "update-status",
  ASSIGN: "assign",
  TAG: "tag",
  MOVE: "move",
} as const;
