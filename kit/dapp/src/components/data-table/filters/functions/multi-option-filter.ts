import type { Row } from "@tanstack/react-table";
import { intersection, uniq } from "../../data-table-array";
import type { FilterValue } from "../types/filter-types";
import { isColumnOptionArray, isStringArray } from "../utils/type-guards";

export function multiOptionFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue<"multiOption", TData>
) {
  const value = row.getValue(columnId);

  if (!value) return false;

  const columnMeta = filterValue.columnMeta;
  if (!columnMeta) return false;

  if (isStringArray(value)) {
    return __multiOptionFilterFn(value, filterValue);
  }

  if (isColumnOptionArray(value)) {
    return __multiOptionFilterFn(
      value.map((v) => v.value),
      filterValue
    );
  }

  if (!columnMeta.transformOptionFn) return false;
  const sanitizedValue = (value as never[])
    .map((v) => columnMeta.transformOptionFn?.(v))
    .filter(Boolean);

  return __multiOptionFilterFn(
    sanitizedValue
      .map((v) => v?.value)
      .filter((v): v is string => v !== undefined),
    filterValue
  );
}

export function __multiOptionFilterFn<TData>(
  inputData: string[],
  filterValue: FilterValue<"multiOption", TData>
) {
  if (inputData.length === 0) return false;

  if (
    filterValue.values.length === 0 ||
    !filterValue.values[0] ||
    filterValue.values[0].length === 0
  )
    return true;

  const values = uniq(inputData);
  const filterValues = uniq(filterValue.values[0]);

  switch (filterValue.operator) {
    case "include":
    case "include any of":
      return intersection(values, filterValues).length > 0;
    case "exclude":
      return intersection(values, filterValues).length === 0;
    case "exclude if any of":
      return intersection(values, filterValues).length === 0;
    case "include all of":
      return intersection(values, filterValues).length === filterValues.length;
    case "exclude if all":
      return !(
        intersection(values, filterValues).length === filterValues.length
      );
  }
}
