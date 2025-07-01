import type { FilterDetails } from "../types/filter-types";

/* Details for all the filter operators for multi-option data type */
export const multiOptionFilterDetails = {
  include: {
    label: "include",
    value: "include",
    target: "single",
    singularOf: "include any of",
    relativeOf: "exclude",
    isNegated: false,
    negation: "exclude",
  },
  exclude: {
    label: "exclude",
    value: "exclude",
    target: "single",
    singularOf: "exclude if any of",
    relativeOf: "include",
    isNegated: true,
    negationOf: "include",
  },
  "include any of": {
    label: "include any of",
    value: "include any of",
    target: "multiple",
    pluralOf: "include",
    relativeOf: ["exclude if all", "include all of", "exclude if any of"],
    isNegated: false,
    negation: "exclude if all",
  },
  "exclude if all": {
    label: "exclude if all",
    value: "exclude if all",
    target: "multiple",
    pluralOf: "exclude",
    relativeOf: ["include any of", "include all of", "exclude if any of"],
    isNegated: true,
    negationOf: "include any of",
  },
  "include all of": {
    label: "include all of",
    value: "include all of",
    target: "multiple",
    pluralOf: "include",
    relativeOf: ["include any of", "exclude if all", "exclude if any of"],
    isNegated: false,
    negation: "exclude if any of",
  },
  "exclude if any of": {
    label: "exclude if any of",
    value: "exclude if any of",
    target: "multiple",
    pluralOf: "exclude",
    relativeOf: ["include any of", "exclude if all", "include all of"],
    isNegated: true,
    negationOf: "include all of",
  },
} as const satisfies FilterDetails<"multiOption">;
