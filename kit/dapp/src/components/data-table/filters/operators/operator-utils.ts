import type { ColumnDataType } from "../types/column-types";
import type { FilterTypes } from "../types/filter-types";
import { filterTypeOperatorDetails } from "./operator-mapping";

interface FilterOperators {
  text: "contains" | "does not contain";
  number:
    | "is"
    | "is not"
    | "is less than"
    | "is greater than or equal to"
    | "is greater than"
    | "is less than or equal to"
    | "is between"
    | "is not between";
  date:
    | "is"
    | "is not"
    | "is before"
    | "is on or after"
    | "is after"
    | "is on or before"
    | "is between"
    | "is not between";
  option: "is" | "is not" | "is any of" | "is none of";
  multiOption:
    | "include"
    | "exclude"
    | "include any of"
    | "include all of"
    | "exclude if any of"
    | "exclude if all";
}

/*
 *
 * Determines the new operator for a filter based on the current operator, old and new filter values.
 *
 * This handles cases where the filter values have transitioned from a single value to multiple values (or vice versa),
 * and the current operator needs to be transitioned to its plural form (or singular form).
 *
 * For example, if the current operator is 'is', and the new filter values have a length of 2, the
 * new operator would be 'is any of'.
 *
 */
export function determineNewOperator<T extends ColumnDataType>(
  type: T,
  oldVals: FilterTypes[T][],
  nextVals: FilterTypes[T][],
  currentOperator: FilterOperators[T]
): FilterOperators[T] {
  const a = oldVals.length;
  const b = nextVals.length;

  // If filter size has not transitioned from single to multiple (or vice versa)
  // or is unchanged, return the current operator.
  if (a === b || (a >= 2 && b >= 2) || (a <= 1 && b <= 1))
    return currentOperator;

  const opDetails = filterTypeOperatorDetails[type][currentOperator];

  // Handle transition from single to multiple filter values.
  if (a < b && b >= 2) return opDetails.singularOf ?? currentOperator;
  // Handle transition from multiple to single filter values.
  if (a > b && b <= 1) return opDetails.pluralOf ?? currentOperator;
  return currentOperator;
}
