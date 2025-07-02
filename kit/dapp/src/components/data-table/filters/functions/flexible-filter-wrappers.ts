import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "../types/filter-types";
import { numberFilterFn } from "./number-filter";
import { textFilterFn } from "./text-filter";

/**
 * Flexible wrapper for number filters that handles both simple values (from URL)
 * and complex filter objects (from UI)
 *
 * @param row - The table row to filter
 * @param columnId - The column identifier
 * @param filterValue - Either a simple string/number or a complex FilterValue object
 * @returns Whether the row passes the filter
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
    if (isNaN(numValue)) return true; // If not a valid number, show all

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
 * and complex filter objects (from UI)
 *
 * @param row - The table row to filter
 * @param columnId - The column identifier
 * @param filterValue - Either a simple string or a complex FilterValue object
 * @returns Whether the row passes the filter
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
