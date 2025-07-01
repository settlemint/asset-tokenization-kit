import type { FilterDetails } from "../types/filter-types";

/* Details for all the filter operators for text data type */
export const textFilterDetails = {
  contains: {
    label: "contains",
    value: "contains",
    target: "single",
    relativeOf: "does not contain",
    isNegated: false,
    negation: "does not contain",
  },
  "does not contain": {
    label: "does not contain",
    value: "does not contain",
    target: "single",
    relativeOf: "contains",
    isNegated: true,
    negationOf: "contains",
  },
} as const satisfies FilterDetails<"text">;
