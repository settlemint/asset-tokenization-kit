"use client";

import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import type {
  BulkAction,
  BulkActionContext,
  BulkActionGroup,
} from "./types/bulk-actions";

/**
 * Factory functions for creating common bulk actions
 */

export function createExportAction<TData>(
  options: {
    filename?: string;
    format?: "csv" | "xlsx" | "json";
    customExporter?: (data: TData[]) => Promise<void> | void;
  } = {}
): BulkAction<TData> {
  const { filename = "export", format = "csv", customExporter } = options;

  return {
    id: "export",
    label: `Export ${format.toUpperCase()}`,
    icon: DownloadIcon,
    variant: "outline",
    execute: async (context: BulkActionContext<TData>) => {
      if (customExporter) {
        await customExporter(context.selectedRows);
        return;
      }

      // Default CSV export
      if (format === "csv" && context.selectedRows.length > 0) {
        const csvContent = convertToCSV(context.selectedRows);
        downloadFile(csvContent, `${filename}.csv`, "text/csv");
      } else if (format === "json") {
        const jsonContent = JSON.stringify(context.selectedRows, null, 2);
        downloadFile(jsonContent, `${filename}.json`, "application/json");
      }
    },
    loadingMessage: "Exporting...",
    successMessage: `${format.toUpperCase()} export completed`,
    errorMessage: "Export failed",
  };
}

export function createDeleteAction<TData>(
  deleteHandler: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void,
  options: {
    requiresConfirmation?: boolean;
    confirmationTitle?: string;
    confirmationDescription?: string;
  } = {}
): BulkAction<TData> {
  const {
    requiresConfirmation = true,
    confirmationTitle = "Delete selected items",
    confirmationDescription = "This action cannot be undone. Are you sure you want to delete the selected items?",
  } = options;

  return {
    id: "delete",
    label: "Delete",
    icon: TrashIcon,
    variant: "destructive",
    requiresConfirmation,
    confirmationTitle,
    confirmationDescription,
    confirmationAction: "Delete",
    execute: async (context: BulkActionContext<TData>) => {
      await deleteHandler(context.selectedRows, context.selectedRowIds);
      context.onComplete();
    },
    loadingMessage: "Deleting...",
    successMessage: "Items deleted successfully",
    errorMessage: "Failed to delete items",
  };
}

export function createArchiveAction<TData>(
  archiveHandler: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void,
  options: {
    requiresConfirmation?: boolean;
    unarchive?: boolean;
  } = {}
): BulkAction<TData> {
  const { requiresConfirmation = false, unarchive = false } = options;

  return {
    id: unarchive ? "unarchive" : "archive",
    label: unarchive ? "Unarchive" : "Archive",
    icon: ArchiveIcon,
    variant: "outline",
    requiresConfirmation,
    execute: async (context: BulkActionContext<TData>) => {
      await archiveHandler(context.selectedRows, context.selectedRowIds);
      context.onComplete();
    },
    loadingMessage: unarchive ? "Unarchiving..." : "Archiving...",
    successMessage: unarchive
      ? "Items unarchived successfully"
      : "Items archived successfully",
    errorMessage: unarchive
      ? "Failed to unarchive items"
      : "Failed to archive items",
  };
}

export function createDuplicateAction<TData>(
  duplicateHandler: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void
): BulkAction<TData> {
  return {
    id: "duplicate",
    label: "Duplicate",
    icon: CopyIcon,
    variant: "outline",
    execute: async (context: BulkActionContext<TData>) => {
      await duplicateHandler(context.selectedRows, context.selectedRowIds);
      context.onComplete();
    },
    loadingMessage: "Duplicating...",
    successMessage: "Items duplicated successfully",
    errorMessage: "Failed to duplicate items",
  };
}

export function createAssignAction<TData>(
  assignHandler: (
    selectedRows: TData[],
    selectedRowIds: string[],
    assigneeId: string
  ) => Promise<void> | void,
  options: {
    assigneeId: string;
    assigneeName: string;
  }
): BulkAction<TData> {
  const { assigneeId, assigneeName } = options;

  return {
    id: "assign",
    label: `Assign to ${assigneeName}`,
    icon: UserIcon,
    variant: "outline",
    execute: async (context: BulkActionContext<TData>) => {
      await assignHandler(
        context.selectedRows,
        context.selectedRowIds,
        assigneeId
      );
      context.onComplete();
    },
    loadingMessage: "Assigning...",
    successMessage: `Items assigned to ${assigneeName}`,
    errorMessage: "Failed to assign items",
  };
}

export function createTagAction<TData>(
  tagHandler: (
    selectedRows: TData[],
    selectedRowIds: string[],
    tags: string[]
  ) => Promise<void> | void,
  options: {
    tags: string[];
    action?: "add" | "remove" | "replace";
  }
): BulkAction<TData> {
  const { tags, action = "add" } = options;
  const tagNames = tags.join(", ");

  return {
    id: "tag",
    label: `${action === "add" ? "Add" : action === "remove" ? "Remove" : "Set"} tags: ${tagNames}`,
    icon: TagIcon,
    variant: "outline",
    execute: async (context: BulkActionContext<TData>) => {
      await tagHandler(context.selectedRows, context.selectedRowIds, tags);
      context.onComplete();
    },
    loadingMessage: "Updating tags...",
    successMessage: "Tags updated successfully",
    errorMessage: "Failed to update tags",
  };
}

/**
 * Predefined action groups for common use cases
 */

export function createCommonActionGroup<TData>(handlers: {
  onExport?: (data: TData[]) => Promise<void> | void;
  onDelete?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
  onArchive?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
  onDuplicate?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
}): BulkActionGroup<TData> {
  const actions: BulkAction<TData>[] = [];

  if (handlers.onExport) {
    actions.push(createExportAction({ customExporter: handlers.onExport }));
  }

  if (handlers.onDuplicate) {
    actions.push(createDuplicateAction(handlers.onDuplicate));
  }

  if (handlers.onArchive) {
    actions.push(createArchiveAction(handlers.onArchive));
  }

  if (handlers.onDelete) {
    actions.push(createDeleteAction(handlers.onDelete));
  }

  return {
    id: "common-actions",
    label: "Common Actions",
    actions,
    separator: true,
  };
}

export function createManagementActionGroup<TData>(
  handlers: {
    onAssign?: (
      selectedRows: TData[],
      selectedRowIds: string[],
      assigneeId: string
    ) => Promise<void> | void;
    onTag?: (
      selectedRows: TData[],
      selectedRowIds: string[],
      tags: string[]
    ) => Promise<void> | void;
  },
  options: {
    assignees?: { id: string; name: string }[];
    availableTags?: string[];
  } = {}
): BulkActionGroup<TData> {
  const actions: BulkAction<TData>[] = [];
  const { assignees = [], availableTags = [] } = options;

  if (handlers.onAssign && assignees.length > 0) {
    assignees.forEach((assignee) => {
      actions.push(
        createAssignAction(handlers.onAssign, {
          assigneeId: assignee.id,
          assigneeName: assignee.name,
        })
      );
    });
  }

  if (handlers.onTag && availableTags.length > 0) {
    actions.push(
      createTagAction(handlers.onTag, {
        tags: availableTags,
        action: "add",
      })
    );
  }

  return {
    id: "management-actions",
    label: "Management",
    actions,
    separator: true,
  };
}

/**
 * Utility functions
 */

function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvHeaders = headers.join(",");

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];
        const stringValue =
          typeof value === "string" || typeof value === "number"
            ? String(value)
            : "";
        // Escape double quotes and wrap in quotes if contains comma, quote, or newline
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Hook for managing bulk action state
 */

export function useBulkActions<TData>(options: {
  onExport?: (data: TData[]) => Promise<void> | void;
  onDelete?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
  onArchive?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
  onDuplicate?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => Promise<void> | void;
  customActions?: BulkAction<TData>[];
}) {
  const {
    onExport,
    onDelete,
    onArchive,
    onDuplicate,
    customActions = [],
  } = options;

  const commonGroup = createCommonActionGroup({
    onExport,
    onDelete,
    onArchive,
    onDuplicate,
  });

  return {
    actions: customActions,
    actionGroups: [commonGroup],
  };
}
