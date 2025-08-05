import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "../types/filter-types";
import { isColumnOption } from "../utils/type-guards";

export function optionFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue<"option", TData>
) {
  const value = row.getValue(columnId);

  if (!value) return false;

  const columnMeta = filterValue.columnMeta;
  if (!columnMeta) return false;

  if (typeof value === "string") {
    return __optionFilterFn(value, filterValue);
  }

  if (isColumnOption(value)) {
    return __optionFilterFn(value.value, filterValue);
  }

  if (!columnMeta.transformOptionFn) return false;
  const sanitizedValue = columnMeta.transformOptionFn(value as never);
  if (!sanitizedValue) return false;
  return __optionFilterFn(sanitizedValue.value, filterValue);
}

export function __optionFilterFn<TData>(
  inputData: string,
  filterValue: FilterValue<"option", TData>
) {
  // If filter has no values, match everything
  if (filterValue.values.length === 0) return true;

  // If filter has empty string as value and input is empty, it's a match
  if (inputData === "" && filterValue.values.includes("")) return true;

  // Otherwise, empty input doesn't match non-empty filter values
  if (!inputData) return false;

  const value = inputData.toLowerCase();

  const found = filterValue.values.some((v) => v && v.toLowerCase() === value);

  switch (filterValue.operator) {
    case "is":
    case "is any of":
      return found;
    case "is not":
    case "is none of":
      return !found;
  }
}
