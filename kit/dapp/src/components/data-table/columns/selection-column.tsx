"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";

/**
 * Creates a basic selection column for data tables with simple checkbox functionality
 */
export function createBasicSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => {
      function handleToggleAll(value: unknown) {
        table.toggleAllPageRowsSelected(!!value);
      }

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={handleToggleAll}
          aria-label="Select all rows on this page"
        />
      );
    },
    cell: ({ row }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={handleToggleRow}
          aria-label={`Select row ${row.index + 1}`}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    meta: {
      enableCsvExport: false,
    },
  };
}

/**
 * Creates a selection column for data tables with enhanced accessibility and styling
 * This is the default SOTA implementation
 */
export function createSelectionColumn<TData>(
  options: {
    enableSelectAll?: boolean;
    ariaLabel?: string;
    className?: string;
  } = {}
): ColumnDef<TData> {
  const { enableSelectAll = true, ariaLabel, className } = options;

  return {
    id: "select",
    header: ({ table }) => {
      if (!enableSelectAll) {
        return <div className="w-10" />;
      }

      const isAllSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();

      function handleToggleAll(value: unknown) {
        table.toggleAllPageRowsSelected(!!value);
      }

      return (
        <Checkbox
          checked={isAllSelected || (isSomeSelected && "indeterminate")}
          onCheckedChange={handleToggleAll}
          aria-label={
            ariaLabel ??
            `Select all ${table.getRowModel().rows.length} rows${
              isSomeSelected && !isAllSelected ? " (some selected)" : ""
            }`
          }
          className={className}
        />
      );
    },
    cell: ({ row, table }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={handleToggleRow}
          aria-label={`Select row ${row.index + 1} of ${table.getRowModel().rows.length}`}
          className={className}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    meta: {
      enableCsvExport: false,
    },
  };
}
