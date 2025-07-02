import type { FilterFn, ColumnDef } from "@tanstack/react-table";
import {
  flexibleNumberFilterFn,
  flexibleTextFilterFn,
} from "./flexible-filter-wrappers";
import { dateFilterFn } from "./date-filter";
import { multiSelectFilterFn } from "./multi-select-filter";

/**
 * Maps column types to their default filter functions
 */
const filterFnMap: Record<string, FilterFn<unknown>> = {
  // Text-based filters
  text: flexibleTextFilterFn,
  address: flexibleTextFilterFn,
  email: flexibleTextFilterFn,
  url: flexibleTextFilterFn,

  // Number-based filters
  number: flexibleNumberFilterFn,
  currency: flexibleNumberFilterFn,
  percentage: flexibleNumberFilterFn,
  decimals: flexibleNumberFilterFn,

  // Date-based filters
  date: dateFilterFn,
  datetime: dateFilterFn,

  // Multi-select filters
  multiSelect: multiSelectFilterFn,
  status: multiSelectFilterFn,
  tags: multiSelectFilterFn,
  badge: multiSelectFilterFn,
};

/**
 * Gets the appropriate filter function based on column type
 * Falls back to flexibleTextFilterFn if type is not found
 */
export function getAutoFilterFn(type?: string): FilterFn<unknown> {
  if (!type) return flexibleTextFilterFn;
  return filterFnMap[type] ?? flexibleTextFilterFn;
}

/**
 * Applies automatic filter functions to a column definition based on meta.type
 * while preserving the ability to override with a custom filterFn
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
  if (columnType) {
    return {
      ...column,
      filterFn: getAutoFilterFn(columnType) as FilterFn<TData>,
    };
  }

  // If it's an accessor column and no type is specified, default to text filter
  if ("accessorKey" in column || "accessorFn" in column) {
    return {
      ...column,
      filterFn: flexibleTextFilterFn as FilterFn<TData>,
    };
  }

  return column;
}

/**
 * Applies withAutoFilterFn to all columns in an array
 */
export function withAutoFilterFns<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((column) => withAutoFilterFn(column));
}
