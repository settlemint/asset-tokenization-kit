import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "../types/filter-types";
import { numberFilterFn } from "./number-filter";
import { textFilterFn } from "./text-filter";

/**
 * Flexible wrapper for number filters that handles both simple values (from URL)
 * and complex filter objects (from UI).
 *
 * @param row - The table row to filter
 * @param columnId - The column identifier to apply the filter to
 * @param filterValue - Either a simple string/number or a complex FilterValue object
 * @returns Whether the row passes the filter criteria
 *
 * @remarks
 * This function acts as an adapter between simple filter values (typically from URL parameters)
 * and the complex filter structure used by the UI. When a simple value is provided,
 * it converts it to a filter object with operator "is" and the numeric value.
 *
 * @example
 * ```ts
 * // Simple value from URL
 * flexibleNumberFilterFn(row, 'price', '100'); // Converts to { operator: 'is', values: [100] }
 *
 * // Complex filter object from UI
 * flexibleNumberFilterFn(row, 'price', {
 *   operator: 'is between',
 *   values: [50, 150],
 *   columnMeta: undefined
 * });
 * ```
 */
export function flexibleNumberFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | number | FilterValue<"number", TData>
) {
  // If it's a simple value (from URL), convert to complex structure
  if (typeof filterValue === "string" || typeof filterValue === "number") {
    const numValue =
      typeof filterValue === "string" ? Number(filterValue) : filterValue;
    if (Number.isNaN(numValue)) return true; // If not a valid number, show all

    return numberFilterFn(row, columnId, {
      operator: "is",
      values: [numValue],
      columnMeta: undefined, // Will be populated by the filter function if needed
    });
  }

  // Otherwise it's already a complex filter object
  return numberFilterFn(row, columnId, filterValue);
}

/**
 * Flexible wrapper for text filters that handles both simple values (from URL)
 * and complex filter objects (from UI).
 *
 * @param row - The table row to filter
 * @param columnId - The column identifier to apply the filter to
 * @param filterValue - Either a simple string or a complex FilterValue object
 * @returns Whether the row passes the filter criteria
 *
 * @remarks
 * This function acts as an adapter between simple filter values (typically from URL parameters)
 * and the complex filter structure used by the UI. When a simple string is provided,
 * it converts it to a filter object with operator "contains" and the string value.
 *
 * @example
 * ```ts
 * // Simple value from URL
 * flexibleTextFilterFn(row, 'name', 'John'); // Converts to { operator: 'contains', values: ['John'] }
 *
 * // Complex filter object from UI
 * flexibleTextFilterFn(row, 'name', {
 *   operator: 'starts with',
 *   values: ['J'],
 *   columnMeta: undefined
 * });
 * ```
 */
export function flexibleTextFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | FilterValue<"text", TData>
) {
  // If it's a simple value (from URL), convert to complex structure
  if (typeof filterValue === "string") {
    return textFilterFn(row, columnId, {
      operator: "contains",
      values: [filterValue],
      columnMeta: undefined, // Will be populated by the filter function if needed
    });
  }

  // Otherwise it's already a complex filter object
  return textFilterFn(row, columnId, filterValue);
}
