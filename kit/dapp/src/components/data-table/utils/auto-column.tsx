import type { ColumnDef } from "@tanstack/react-table";
import { AutoCell } from "../cells/auto-cell";
import { flexRender } from "@tanstack/react-table";
import { withAutoFilterFn } from "../filters/functions/auto-filter";

/**
 * Wraps a column definition to use AutoCell rendering based on meta.cellType
 * while preserving the ability to override with a custom cell renderer.
 *
 * @example
 * ```tsx
 * const column = withAutoCell({
 *   id: "amount",
 *   header: "Amount",
 *   meta: { cellType: "currency" }
 * });
 * ```
 *
 * @param column - The column definition to enhance
 * @returns Enhanced column definition with AutoCell rendering
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
 * Applies withAutoCell to all columns in an array.
 * Batch operation for enhancing multiple columns at once.
 *
 * @example
 * ```tsx
 * const enhancedColumns = withAutoCells([
 *   { id: "name", header: "Name" },
 *   { id: "amount", header: "Amount", meta: { cellType: "currency" } }
 * ]);
 * ```
 *
 * @param columns - Array of column definitions to enhance
 * @returns Array of enhanced column definitions
 */
export function withAutoCells<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) => withAutoCell(column));
}

/**
 * Automatically sets the variant based on column type.
 * Numeric columns (number, currency) get the "numeric" variant for right alignment.
 *
 * @example
 * ```tsx
 * const column = withAutoVariant({
 *   id: "price",
 *   header: "Price",
 *   meta: { type: "currency" }
 * });
 * // Result: column.meta.variant === "numeric"
 * ```
 *
 * @param column - The column definition to enhance
 * @returns Column definition with auto-set variant
 */
export function withAutoVariant<TData, TValue = unknown>(
  column: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue> {
  // If column has number or currency type, set variant to numeric
  if (column.meta?.type === "number" || column.meta?.type === "currency") {
    return {
      ...column,
      meta: {
        ...column.meta,
        variant: "numeric",
      },
    };
  }

  return column;
}

/**
 * Applies both auto cell rendering and auto filter functions to columns.
 * This is the recommended function to use for maximum automation.
 * Combines withAutoCell, withAutoFilterFn, and withAutoVariant.
 *
 * @example
 * ```tsx
 * const columns = withAutoFeatures([
 *   {
 *     id: "name",
 *     header: "Name",
 *     meta: { type: "text" }
 *   },
 *   {
 *     id: "amount",
 *     header: "Amount",
 *     meta: { type: "currency", cellType: "currency" }
 *   }
 * ]);
 * ```
 *
 * @param columns - Array of column definitions to enhance
 * @returns Fully enhanced column definitions with auto features
 */
export function withAutoFeatures<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) =>
    withAutoVariant(withAutoFilterFn(withAutoCell(column)))
  );
}
