import type { ColumnDataType } from "../types/column-types";
import { dateFilterFn } from "./date-filter";
import { multiOptionFilterFn } from "./multi-option-filter";
import { numberFilterFn } from "./number-filter";
import { optionFilterFn } from "./option-filter";
import { textFilterFn } from "./text-filter";

/*
 * Returns a filter function for a given column data type.
 * This function is used to determine the appropriate filter function to use based on the column data type.
 */
export function filterFn(dataType: ColumnDataType) {
  switch (dataType) {
    case "option":
      return optionFilterFn;
    case "multiOption":
      return multiOptionFilterFn;
    case "date":
      return dateFilterFn;
    case "text":
      return textFilterFn;
    case "number":
      return numberFilterFn;
    default:
      throw new Error("Invalid column data type");
  }
}
