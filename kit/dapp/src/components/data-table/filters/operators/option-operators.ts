import type { FilterDetails } from "../types/filter-types";

/* Details for all the filter operators for option data type */
export const optionFilterDetails = {
  is: {
    label: "is",
    value: "is",
    target: "single",
    singularOf: "is not",
    relativeOf: "is any of",
    isNegated: false,
    negation: "is not",
  },
  "is not": {
    label: "is not",
    value: "is not",
    target: "single",
    singularOf: "is",
    relativeOf: "is none of",
    isNegated: true,
    negationOf: "is",
  },
  "is any of": {
    label: "is any of",
    value: "is any of",
    target: "multiple",
    pluralOf: "is",
    relativeOf: "is",
    isNegated: false,
    negation: "is none of",
  },
  "is none of": {
    label: "is none of",
    value: "is none of",
    target: "multiple",
    pluralOf: "is not",
    relativeOf: "is not",
    isNegated: true,
    negationOf: "is any of",
  },
} as const satisfies FilterDetails<"option">;
