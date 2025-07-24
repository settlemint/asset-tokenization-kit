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

/**
 * Creates a bulk action for exporting selected rows to various formats.
 * Supports CSV, XLSX, and JSON formats with custom export handlers.
 *
 * @example
 * ```tsx
 * const exportAction = createExportAction({
 *   filename: "users-export",
 *   format: "csv"
 * });
 * ```
 *
 * @param options - Export configuration options
 * @param options.filename - Base filename for the export (without extension)
 * @param options.format - Export format: "csv", "xlsx", or "json"
 * @param options.customExporter - Custom function to handle the export
 * @returns A configured bulk action for exporting data
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

/**
 * Creates a bulk action for deleting selected rows with optional confirmation.
 * Provides configurable confirmation dialog to prevent accidental deletions.
 *
 * @example
 * ```tsx
 * const deleteAction = createDeleteAction(
 *   async (rows, ids) => {
 *     await api.deleteUsers(ids);
 *   },
 *   {
 *     requiresConfirmation: true,
 *     confirmationTitle: "Delete Users"
 *   }
 * );
 * ```
 *
 * @param deleteHandler - Function to handle the deletion of selected rows
 * @param options - Delete action configuration
 * @param options.requiresConfirmation - Whether to show confirmation dialog
 * @param options.confirmationTitle - Title for the confirmation dialog
 * @param options.confirmationDescription - Description for the confirmation dialog
 * @returns A configured bulk delete action
 */
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

/**
 * Creates a bulk action for archiving or unarchiving selected rows.
 * Supports both archive and unarchive operations with optional confirmation.
 *
 * @example
 * ```tsx
 * const archiveAction = createArchiveAction(
 *   async (rows, ids) => {
 *     await api.archiveItems(ids);
 *   },
 *   { requiresConfirmation: true }
 * );
 * ```
 *
 * @param archiveHandler - Function to handle the archive/unarchive operation
 * @param options - Archive action configuration
 * @param options.requiresConfirmation - Whether to show confirmation dialog
 * @param options.unarchive - Whether this is an unarchive action (default: false)
 * @returns A configured bulk archive action
 */
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

/**
 * Creates a bulk action for duplicating selected rows.
 *
 * @example
 * ```tsx
 * const duplicateAction = createDuplicateAction(
 *   async (rows, ids) => {
 *     await api.duplicateItems(rows);
 *   }
 * );
 * ```
 *
 * @param duplicateHandler - Function to handle the duplication of selected rows
 * @returns A configured bulk duplicate action
 */
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

/**
 * Creates a bulk action for assigning selected rows to a specific user or entity.
 *
 * @example
 * ```tsx
 * const assignAction = createAssignAction(
 *   async (rows, ids, assigneeId) => {
 *     await api.assignItems(ids, assigneeId);
 *   },
 *   {
 *     assigneeId: "user-123",
 *     assigneeName: "John Doe"
 *   }
 * );
 * ```
 *
 * @param assignHandler - Function to handle the assignment operation
 * @param options - Assignment configuration
 * @param options.assigneeId - ID of the assignee
 * @param options.assigneeName - Display name of the assignee
 * @returns A configured bulk assign action
 */
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

/**
 * Creates a bulk action for managing tags on selected rows.
 * Supports adding, removing, or replacing tags.
 *
 * @example
 * ```tsx
 * const tagAction = createTagAction(
 *   async (rows, ids, tags) => {
 *     await api.addTags(ids, tags);
 *   },
 *   {
 *     tags: ["important", "review"],
 *     action: "add"
 *   }
 * );
 * ```
 *
 * @param tagHandler - Function to handle the tag operation
 * @param options - Tag action configuration
 * @param options.tags - Array of tags to apply
 * @param options.action - Type of tag operation: "add", "remove", or "replace"
 * @returns A configured bulk tag action
 */
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

/**
 * Creates a predefined group of common bulk actions.
 * Automatically generates export, duplicate, archive, and delete actions based on provided handlers.
 *
 * @example
 * ```tsx
 * const commonActions = createCommonActionGroup({
 *   onExport: async (data) => downloadCSV(data),
 *   onDelete: async (rows, ids) => api.deleteItems(ids),
 *   onArchive: async (rows, ids) => api.archiveItems(ids)
 * });
 * ```
 *
 * @param handlers - Object containing handler functions for each action type
 * @param handlers.onExport - Handler for export action
 * @param handlers.onDelete - Handler for delete action
 * @param handlers.onArchive - Handler for archive action
 * @param handlers.onDuplicate - Handler for duplicate action
 * @returns A bulk action group containing all configured actions
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

/**
 * Creates a group of management-related bulk actions.
 * Includes assignment and tagging actions for organizational workflows.
 *
 * @example
 * ```tsx
 * const managementActions = createManagementActionGroup(
 *   {
 *     onAssign: async (rows, ids, assigneeId) => api.assign(ids, assigneeId),
 *     onTag: async (rows, ids, tags) => api.addTags(ids, tags)
 *   },
 *   {
 *     assignees: [
 *       { id: "user-1", name: "Alice" },
 *       { id: "user-2", name: "Bob" }
 *     ],
 *     availableTags: ["urgent", "review", "done"]
 *   }
 * );
 * ```
 *
 * @param handlers - Object containing handler functions
 * @param handlers.onAssign - Handler for assignment operations
 * @param handlers.onTag - Handler for tagging operations
 * @param options - Configuration for available assignees and tags
 * @param options.assignees - Array of available assignees with id and name
 * @param options.availableTags - Array of available tag strings
 * @returns A bulk action group for management operations
 */
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
    const onAssign = handlers.onAssign;
    assignees.forEach((assignee) => {
      actions.push(
        createAssignAction(onAssign, {
          assigneeId: assignee.id,
          assigneeName: assignee.name,
        })
      );
    });
  }

  if (handlers.onTag && availableTags.length > 0) {
    const onTag = handlers.onTag;
    actions.push(
      createTagAction(onTag, {
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

/**
 * Converts an array of objects to CSV format.
 * Handles special characters, escaping, and proper formatting.
 *
 * @param data - Array of objects to convert to CSV
 * @returns CSV formatted string with headers and rows
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
          return `"${stringValue.replaceAll('"', '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Triggers a file download in the browser.
 * Creates a blob from the content and initiates download.
 *
 * @param content - File content as string
 * @param filename - Name for the downloaded file
 * @param mimeType - MIME type of the file (e.g., "text/csv")
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Hook for managing bulk action state
 */

/**
 * Hook for managing bulk action state and configuration.
 * Provides a convenient way to set up common bulk actions with custom handlers.
 *
 * @example
 * ```tsx
 * const { actions, actionGroups } = useBulkActions({
 *   onDelete: async (rows, ids) => {
 *     await api.deleteItems(ids);
 *   },
 *   onExport: (data) => {
 *     downloadCSV(data);
 *   },
 *   customActions: [customBulkAction]
 * });
 * ```
 *
 * @param options - Bulk action configuration
 * @param options.onExport - Handler for export operations
 * @param options.onDelete - Handler for delete operations
 * @param options.onArchive - Handler for archive operations
 * @param options.onDuplicate - Handler for duplicate operations
 * @param options.customActions - Array of custom bulk actions
 * @returns Object containing actions array and actionGroups array
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
