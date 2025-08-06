import type { Column } from "@tanstack/react-table";
import type { ColumnDataType } from "./column-types";

/* Operators for text data */
export type TextFilterOperator = "contains" | "does not contain";

/* Operators for number data */
export type NumberFilterOperator =
  | "is"
  | "is not"
  | "is less than"
  | "is greater than or equal to"
  | "is greater than"
  | "is less than or equal to"
  | "is between"
  | "is not between";

/* Operators for date data */
export type DateFilterOperator =
  | "is"
  | "is not"
  | "is before"
  | "is on or after"
  | "is after"
  | "is on or before"
  | "is between"
  | "is not between";

/* Operators for option data */
export type OptionFilterOperator = "is" | "is not" | "is any of" | "is none of";

/* Operators for multi-option data */
export type MultiOptionFilterOperator =
  | "include"
  | "exclude"
  | "include any of"
  | "include all of"
  | "exclude if any of"
  | "exclude if all";

/* Maps filter operators to their respective data types */
interface FilterOperators {
  text: TextFilterOperator;
  number: NumberFilterOperator;
  date: DateFilterOperator;
  option: OptionFilterOperator;
  multiOption: MultiOptionFilterOperator;
}

/* Maps filter values to their respective data types */
export interface FilterTypes {
  text: string;
  number: number;
  date: Date;
  option: string;
  multiOption: string[];
}

/* Date range for date filters */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/* Number range for number filters */
export interface NumberRange {
  min?: number;
  max?: number;
}

/* General filter operator type */
export type FilterOperator =
  | TextFilterOperator
  | NumberFilterOperator
  | DateFilterOperator
  | OptionFilterOperator
  | MultiOptionFilterOperator;

/* Individual operator types for backwards compatibility */
export type TextOperator = TextFilterOperator;
export type NumberOperator = NumberFilterOperator;
export type DateOperator = DateFilterOperator;
export type OptionOperator = OptionFilterOperator;
export type MultiOptionOperator = MultiOptionFilterOperator;

/*
 *
 * FilterValue is a type that represents a filter value for a specific column.
 *
 * It consists of:
 * - Operator: The operator to be used for the filter.
 * - Values: An array of values to be used for the filter.
 *
 */
export interface FilterValue<T extends ColumnDataType, TData> {
  operator: FilterOperators[T];
  values: FilterTypes[T][];
  columnMeta: Column<TData>["columnDef"]["meta"];
}

/*
 * FilterDetails is a type that represents the details of all the filter operators for a specific column data type.
 */
export type FilterDetails<T extends ColumnDataType> = {
  [key in FilterOperators[T]]: FilterOperatorDetails<key, T>;
};

interface FilterOperatorDetailsBase<OperatorValue, T extends ColumnDataType> {
  /* The operator value. Usually the string representation of the operator. */
  value: OperatorValue;
  /* The label for the operator, to show in the UI. */
  label: string;
  /* How much data the operator applies to. */
  target: "single" | "multiple";
  /* The plural form of the operator, if applicable. */
  singularOf?: FilterOperators[T];
  /* The singular form of the operator, if applicable. */
  pluralOf?: FilterOperators[T];
  /* All related operators. Normally, all the operators which share the same target. */
  relativeOf: FilterOperators[T] | FilterOperators[T][];
  /* Whether the operator is negated. */
  isNegated: boolean;
  /* If the operator is not negated, this provides the negated equivalent. */
  negation?: FilterOperators[T];
  /* If the operator is negated, this provides the positive equivalent. */
  negationOf?: FilterOperators[T];
}

/*
 *
 * FilterOperatorDetails is a type that provides details about a filter operator for a specific column data type.
 * It extends FilterOperatorDetailsBase with additional logic and contraints on the defined properties.
 *
 */
export type FilterOperatorDetails<
  OperatorValue,
  T extends ColumnDataType,
> = FilterOperatorDetailsBase<OperatorValue, T> &
  (
    | { singularOf?: never; pluralOf?: never }
    | { target: "single"; singularOf: FilterOperators[T]; pluralOf?: never }
    | { target: "multiple"; singularOf?: never; pluralOf: FilterOperators[T] }
  ) &
  (
    | { isNegated: false; negation: FilterOperators[T]; negationOf?: never }
    | { isNegated: true; negation?: never; negationOf: FilterOperators[T] }
  );
