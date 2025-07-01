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
        <div className="flex items-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={handleToggleAll}
            aria-label="Select all rows on this page"
            className="translate-y-[2px]"
          />
        </div>
      );
    },
    cell: ({ row }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      return (
        <div className="flex items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={handleToggleRow}
            aria-label={`Select row ${row.index + 1}`}
            className="translate-y-[2px]"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
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
        <div className="flex items-center justify-center">
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
        </div>
      );
    },
    cell: ({ row, table }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={handleToggleRow}
            aria-label={`Select row ${row.index + 1} of ${table.getRowModel().rows.length}`}
            className={className}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
  };
}
