"use client";

import { DataTable } from "../data-table";
import { createSelectionColumn } from "../columns/selection-column";
import { useBulkActions } from "../data-table-bulk-actions";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

// Example data type
interface ExampleData {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  tags?: string[];
}

// Example data
const exampleData: ExampleData[] = [
  {
    id: "1",
    name: "Asset Alpha",
    status: "active",
    createdAt: "2024-01-15",
    tags: ["crypto", "high-value"],
  },
  {
    id: "2",
    name: "Asset Beta",
    status: "inactive",
    createdAt: "2024-01-10",
    tags: ["traditional"],
  },
  {
    id: "3",
    name: "Asset Gamma",
    status: "pending",
    createdAt: "2024-01-12",
    tags: ["crypto", "pending-review"],
  },
];

export function BulkActionsExample() {
  // Define columns with selection column
  const columns: ColumnDef<ExampleData>[] = useMemo(
    () => [
      createSelectionColumn<ExampleData>(),
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status");
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : status === "inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.getValue("tags");
          if (!Array.isArray(tags) || tags.length === 0) return null;
          return (
            <div className="flex gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const handleExport = useCallback(async (data: ExampleData[]) => {
    console.log("Exporting data:", data);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, []);

  const handleDelete = useCallback(
    async (selectedRows: ExampleData[], selectedRowIds: string[]) => {
      console.log("Deleting:", { selectedRows, selectedRowIds });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    []
  );

  const handleArchive = useCallback(
    async (selectedRows: ExampleData[], selectedRowIds: string[]) => {
      console.log("Archiving:", { selectedRows, selectedRowIds });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1200));
    },
    []
  );

  const handleDuplicate = useCallback(
    async (selectedRows: ExampleData[], selectedRowIds: string[]) => {
      console.log("Duplicating:", { selectedRows, selectedRowIds });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    []
  );

  // Setup bulk actions
  const { actions, actionGroups } = useBulkActions<ExampleData>({
    onExport: handleExport,
    onDelete: handleDelete,
    onArchive: handleArchive,
    onDuplicate: handleDuplicate,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Bulk Actions Example
        </h2>
        <p className="text-muted-foreground">
          Example usage of DataTable with bulk actions enabled. Select rows to
          see the action bar.
        </p>
      </div>

      <DataTable
        columns={useCallback(() => columns, [columns])}
        data={exampleData}
        name="bulk-actions-example"
        toolbar={{
          enableToolbar: true,
        }}
        pagination={{
          enablePagination: true,
        }}
        bulkActions={{
          enabled: true,
          actions,
          actionGroups,
          position: "bottom",
          showSelectionCount: true,
          enableSelectAll: true,
        }}
        className="border"
      />
    </div>
  );
}

/**
 * Example with custom bulk actions
 */
export function CustomBulkActionsExample() {
  const columns: ColumnDef<ExampleData>[] = useMemo(
    () => [
      createSelectionColumn<ExampleData>(),
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
    ],
    []
  );

  // Custom bulk actions
  const customActions = useMemo(
    () => [
      {
        id: "update-status",
        label: "Mark as Active",
        variant: "outline" as const,
        execute: async ({
          selectedRows,
          onComplete,
        }: {
          selectedRows: ExampleData[];
          onComplete: () => void;
        }) => {
          console.log("Updating status for:", selectedRows);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          onComplete();
        },
        disabled: ({ selectedRows }: { selectedRows: ExampleData[] }) =>
          selectedRows.every((row: ExampleData) => row.status === "active"),
      },
      {
        id: "send-notification",
        label: "Send Notification",
        variant: "secondary" as const,
        execute: async ({
          selectedRows,
          onComplete,
        }: {
          selectedRows: ExampleData[];
          onComplete: () => void;
        }) => {
          console.log("Sending notifications for:", selectedRows);
          await new Promise((resolve) => setTimeout(resolve, 800));
          onComplete();
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Custom Bulk Actions Example
        </h2>
        <p className="text-muted-foreground">
          Example with custom bulk actions and conditional enabling.
        </p>
      </div>

      <DataTable
        columns={useCallback(() => columns, [columns])}
        data={exampleData}
        name="custom-bulk-actions-example"
        toolbar={{
          enableToolbar: true,
        }}
        bulkActions={{
          enabled: true,
          actions: customActions,
          position: "top",
          showSelectionCount: true,
          enableSelectAll: true,
        }}
        className="border"
      />
    </div>
  );
}
