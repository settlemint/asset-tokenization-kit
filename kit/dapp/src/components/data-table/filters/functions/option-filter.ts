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
  return __optionFilterFn(sanitizedValue.value, filterValue);
}

export function __optionFilterFn<TData>(
  inputData: string,
  filterValue: FilterValue<"option", TData>
) {
  if (!inputData) return false;
  if (filterValue.values.length === 0) return true;

  const value = inputData.toString().toLowerCase();

  const found = !!filterValue.values.find((v) => v.toLowerCase() === value);

  switch (filterValue.operator) {
    case "is":
    case "is any of":
      return found;
    case "is not":
    case "is none of":
      return !found;
  }
}
