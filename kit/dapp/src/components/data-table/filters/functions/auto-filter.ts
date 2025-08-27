import { optionFilterFn } from "@/components/data-table/filters/functions/option-filter";
import type { FormatType } from "@/lib/utils/format-value/types";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { dateFilterFn } from "./date-filter";
import {
  flexibleNumberFilterFn,
  flexibleTextFilterFn,
} from "./flexible-filter-wrappers";
import { multiOptionFilterFn } from "./multi-option-filter";

/**
 * Maps column types to their default filter functions.
 * This mapping is used to automatically assign appropriate filter functions
 * based on the column's data type.
 *
 * @example
 * ```ts
 * // Column types and their associated filter functions:
 * // - text, address, email, url → flexibleTextFilterFn
 * // - number, currency, percentage, decimals → flexibleNumberFilterFn
 * // - date, datetime → dateFilterFn
 * // - multiSelect, status, tags, badge → multiOptionFilterFn
 * ```
 */
const filterFnMap: Record<FormatType, FilterFn<unknown>> = {
  // Text-based filters
  text: flexibleTextFilterFn,
  address: flexibleTextFilterFn,

  // Number-based filters
  number: flexibleNumberFilterFn,
  currency: flexibleNumberFilterFn,
  percentage: flexibleNumberFilterFn,
  basisPoints: flexibleNumberFilterFn,

  // Date-based filters
  date: dateFilterFn,

  // Multi-select filters
  multiOption: multiOptionFilterFn,
  option: optionFilterFn,
  status: optionFilterFn,

  // Boolean filters
  boolean: flexibleTextFilterFn,

  // Special types
  none: flexibleTextFilterFn,
};

/**
 * Gets the appropriate filter function based on column type.
 * Falls back to flexibleTextFilterFn if type is not found.
 *
 * @param type - The column data type (e.g., 'text', 'number', 'date', 'multiSelect')
 * @returns The corresponding filter function for the given type
 *
 * @example
 * ```ts
 * const filterFn = getAutoFilterFn('number'); // Returns flexibleNumberFilterFn
 * const filterFn = getAutoFilterFn('unknown'); // Returns flexibleTextFilterFn (fallback)
 * const filterFn = getAutoFilterFn(); // Returns flexibleTextFilterFn (no type provided)
 * ```
 */
export function getAutoFilterFn(type?: FormatType): FilterFn<unknown> {
  if (!type) return flexibleTextFilterFn;
  return filterFnMap[type] || flexibleTextFilterFn;
}

/**
 * Applies automatic filter functions to a column definition based on meta.type
 * while preserving the ability to override with a custom filterFn.
 *
 * @param column - The column definition to enhance with automatic filtering
 * @returns The column definition with appropriate filter function applied
 *
 * @remarks
 * This function follows these rules:
 * 1. If column already has a filterFn, it's preserved (allows custom override)
 * 2. If column has enableColumnFilter set to false, no filter is applied
 * 3. If column has meta.type, the corresponding filter function is applied
 * 4. If column is an accessor column without type, defaults to text filter
 * 5. Otherwise, returns the column unchanged
 *
 * @example
 * ```ts
 * const column: ColumnDef<User> = {
 *   accessorKey: 'age',
 *   meta: { type: 'number' }
 * };
 * const enhanced = withAutoFilterFn(column);
 * // enhanced.filterFn will be flexibleNumberFilterFn
 * ```
 */
export function withAutoFilterFn<TData, TValue = unknown>(
  column: ColumnDef<TData, TValue>
): ColumnDef<TData, TValue> {
  // If column already has a filterFn, keep it (allows override)
  if (column.filterFn || column.enableColumnFilter === false) {
    return column;
  }

  // If column has meta.type, apply the appropriate filter function
  const columnType = column.meta?.type;
  if (!columnType || columnType === "none") {
    return column;
  }

  return {
    ...column,
    filterFn: getAutoFilterFn(columnType) as FilterFn<TData>,
  };
}

/**
 * Applies withAutoFilterFn to all columns in an array.
 * This is a convenience function for enhancing multiple columns at once.
 *
 * @param columns - Array of column definitions to enhance
 * @returns Array of column definitions with appropriate filter functions applied
 */
export function withAutoFilterFns<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) => withAutoFilterFn(column));
}
