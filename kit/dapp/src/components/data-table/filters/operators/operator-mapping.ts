import type { ColumnDataType } from "../types/column-types";
import type { FilterDetails } from "../types/filter-types";
import { dateFilterDetails } from "./date-operators";
import { multiOptionFilterDetails } from "./multi-option-operators";
import { numberFilterDetails } from "./number-operators";
import { optionFilterDetails } from "./option-operators";
import { textFilterDetails } from "./text-operators";

/* Maps column data types to their respective filter operator details */
type FilterTypeOperatorDetails = {
  [key in ColumnDataType]: FilterDetails<key>;
};

export const filterTypeOperatorDetails: FilterTypeOperatorDetails = {
  text: textFilterDetails,
  number: numberFilterDetails,
  date: dateFilterDetails,
  option: optionFilterDetails,
  multiOption: multiOptionFilterDetails,
};
