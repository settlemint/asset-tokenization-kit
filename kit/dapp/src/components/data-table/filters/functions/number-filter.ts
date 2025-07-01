import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "../types/filter-types";

export function numberFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue<"number", TData>
) {
  const value = row.getValue<number>(columnId);

  return __numberFilterFn(value, filterValue);
}

export function __numberFilterFn<TData>(
  inputData: number,
  filterValue: FilterValue<"number", TData>
) {
  if (filterValue.values.length === 0) {
    return true;
  }

  const value = inputData;
  const filterVal = filterValue.values[0];

  if (filterVal === undefined) return true;

  switch (filterValue.operator) {
    case "is":
      return value === filterVal;
    case "is not":
      return value !== filterVal;
    case "is greater than":
      return value > filterVal;
    case "is greater than or equal to":
      return value >= filterVal;
    case "is less than":
      return value < filterVal;
    case "is less than or equal to":
      return value <= filterVal;
    case "is between": {
      const lowerBound = filterValue.values[0];
      const upperBound = filterValue.values[1];
      if (lowerBound === undefined || upperBound === undefined) return true;
      return value >= lowerBound && value <= upperBound;
    }
    case "is not between": {
      const lowerBound = filterValue.values[0];
      const upperBound = filterValue.values[1];
      if (lowerBound === undefined || upperBound === undefined) return true;
      return value < lowerBound || value > upperBound;
    }
    default:
      return true;
  }
}
