import { formatValue } from "@/lib/utils/format-value";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { withAutoFilterFn } from "../filters/functions/auto-filter";

/**
 * Component wrapper for formatValue to use in cell rendering
 */
function FormattedCell<TData, TValue>({
  context,
}: {
  context: CellContext<TData, TValue>;
}) {
  const meta = context.column.columnDef.meta;
  const value = context.getValue();

  // Use the shared formatValue utility
  return (
    <>
      {formatValue(value, {
        type: meta?.type ?? "text",
        displayName: meta?.displayName,
        currency: meta?.currency,
        emptyValue: meta?.emptyValue,
        showPrettyName: meta?.showPrettyName,
      })}
    </>
  );
}

/**
 * Wraps a column definition to use automatic value formatting based on meta.type
 * while preserving the ability to override with a custom cell renderer.
 *
 * @example
 * ```tsx
 * const column = withAutoCell({
 *   id: "amount",
 *   header: "Amount",
 *   meta: { type: "currency" }
 * });
 * ```
 *
 * @param column - The column definition to enhance
 * @returns Enhanced column definition with automatic formatting
 */
export function withAutoCell<TData, TValue = unknown>(
  column: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue> {
  if (column.cell) {
    return column;
  }

  // If no cell renderer, use FormattedCell directly
  return {
    ...column,
    cell: (context) => <FormattedCell context={context} />,
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
 *   { id: "amount", header: "Amount", meta: { type: "currency" } }
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
 * Applies automatic variant setting based on column type.
 * Numeric types get 'numeric' variant for right alignment.
 *
 * @param column - The column definition to enhance
 * @returns Enhanced column definition with automatic variant
 */
function withAutoVariant<TData, TValue = unknown>(
  column: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue> {
  // Don't override existing variant
  if (column.meta?.variant) {
    return column;
  }

  const columnType = column.meta?.type;
  const numericTypes = ["number", "currency", "percentage", "basisPoints"];

  if (columnType && numericTypes.includes(columnType)) {
    return {
      ...column,
      meta: {
        ...column.meta,
        type: columnType, // Ensure type is defined
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
 *     meta: { type: "currency" } // Will automatically get variant: "numeric"
 *   }
 * ]);
 * ```
 *
 * @param columns - Array of column definitions to enhance
 * @returns Fully enhanced column definitions with auto features
 */
export function withAutoFeatures<ColumnDefs>(columns: ColumnDefs): ColumnDefs {
  return (columns as ColumnDef<unknown>[]).map((column) =>
    withAutoFilterFn(withAutoVariant(withAutoCell(column)))
  ) as ColumnDefs;
}
