import type { ColumnDef } from "@tanstack/react-table";
import { AutoCell } from "../cells/auto-cell";
import { flexRender } from "@tanstack/react-table";
import { withAutoFilterFn } from "../filters/functions/auto-filter";
import "../types/table-meta";

/**
 * Wraps a column definition to use AutoCell rendering based on meta.cellType
 * while preserving the ability to override with a custom cell renderer
 */
export function withAutoCell<TData, TValue = unknown>(
  column: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue> {
  // If column already has a cell renderer, wrap it with AutoCell
  // This allows the custom renderer to be used as override
  if (column.cell) {
    const originalCell = column.cell;
    return {
      ...column,
      cell: (context) => (
        <AutoCell context={context}>
          {flexRender(originalCell, context)}
        </AutoCell>
      ),
    };
  }

  // If no cell renderer, use AutoCell directly
  return {
    ...column,
    cell: (context) => <AutoCell context={context} />,
  };
}

/**
 * Applies withAutoCell to all columns in an array
 */
export function withAutoCells<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) => withAutoCell(column));
}

/**
 * Applies both auto cell rendering and auto filter functions to columns
 * This is the recommended function to use for maximum automation
 */
export function withAutoFeatures<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) => withAutoFilterFn(withAutoCell(column)));
}
