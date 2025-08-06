import type { Row } from "@tanstack/react-table";
import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import type { FilterValue } from "../types/filter-types";
import { dateFilterDetails } from "../operators/date-operators";

export function dateFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue<"date", TData>
) {
  const valueStr = row.getValue<Date>(columnId);

  return __dateFilterFn(valueStr, filterValue);
}

export function __dateFilterFn<TData>(
  inputData: Date,
  filterValue: FilterValue<"date", TData>
) {
  if (!inputData) return false;
  if (filterValue.values.length === 0) return true;

  if (
    dateFilterDetails[filterValue.operator].target === "single" &&
    filterValue.values.length > 1
  )
    throw new Error("Singular operators require at most one filter value");

  if (
    ["is between", "is not between"].includes(filterValue.operator) &&
    filterValue.values.length !== 2
  )
    throw new Error("Plural operators require two filter values");

  const filterVals = filterValue.values;
  const d1 = filterVals[0];
  const d2 = filterVals[1];

  const value = inputData;

  if (!d1) return false;

  switch (filterValue.operator) {
    case "is":
      return isSameDay(value, d1);
    case "is not":
      return !isSameDay(value, d1);
    case "is before":
      return isBefore(value, startOfDay(d1));
    case "is on or after":
      return isSameDay(value, d1) || isAfter(value, startOfDay(d1));
    case "is after":
      return isAfter(value, endOfDay(d1));
    case "is on or before":
      return isSameDay(value, d1) || isBefore(value, startOfDay(d1));
    case "is between":
      if (!d2) return false;
      return isWithinInterval(value, {
        start: startOfDay(d1),
        end: endOfDay(d2),
      });
    case "is not between":
      if (!d2) return false;
      return !isWithinInterval(value, {
        start: startOfDay(d1),
        end: endOfDay(d2),
      });
  }
}
