import type React from "react";

export type ElementType<T> = T extends (infer U)[] ? U : T;

export interface ColumnOption {
  /* The label to display for the option. */
  label: string;
  /* The internal value of the option. */
  value: string;
  /* An optional icon to display next to the label. */
  icon?: React.ReactElement | React.ElementType;
}

export interface ColumnOptionWithIcon extends ColumnOption {
  icon: React.ReactElement | React.ElementType;
}

export interface FilterableColumnMeta {
  /* The data type of the column for filtering purposes */
  dataType?: ColumnDataType;
  /* Transform function for option-based filters */
  transformOptionFn?: (value: unknown) => ColumnOption;
  /* Placeholder text for filters */
  placeholder?: string;
  /* Minimum value for number filters */
  min?: number;
  /* Maximum value for number filters */
  max?: number;
  /* Date format for date filters */
  dateFormat?: string;
}

export type ColumnType = ColumnDataType;

/*
 * Represents the data type of a column.
 */
export type ColumnDataType =
  /* The column value is a string that should be searchable. */
  | "text"
  | "number"
  | "date"
  /* The column value can be a single value from a list of options. */
  | "option"
  /* The column value can be zero or more values from a list of options. */
  | "multiOption";
