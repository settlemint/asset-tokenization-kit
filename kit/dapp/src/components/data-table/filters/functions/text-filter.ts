import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "../types/filter-types";

export function textFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue<"text", TData>
) {
  const value = row.getValue<string>(columnId) || "";

  return __textFilterFn(value, filterValue);
}

export function __textFilterFn<TData>(
  inputData: string,
  filterValue: FilterValue<"text", TData>
) {
  if (filterValue.values.length === 0) return true;

  const value = inputData.toLowerCase().trim();
  const filterStr = filterValue.values[0]?.toLowerCase().trim() ?? "";

  if (filterStr === "") return true;

  const found = value.includes(filterStr);

  switch (filterValue.operator) {
    case "contains":
      return found;
    case "does not contain":
      return !found;
  }
}
