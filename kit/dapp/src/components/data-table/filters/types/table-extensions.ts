import type { RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ColumnDataType, ColumnOption, ElementType } from "./column-types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /* The display name of the column. */
    displayName?: string;

    /* The column icon. */
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;

    /* The data type of the column. */
    type?: ColumnDataType | (string & {});

    /* An optional list of options for the column. */
    /* This is used for columns with type 'option' or 'multiOption'. */
    /* If the options are known ahead of time, they can be defined here. */
    /* Otherwise, they will be dynamically generated based on the data. */
    options?: ColumnOption[];

    /* An optional function to transform columns with type 'option' or 'multiOption'. */
    /* This is used to convert each raw option into a ColumnOption. */
    transformOptionFn?: (
      value: ElementType<NonNullable<TValue>>
    ) => ColumnOption;

    /* An optional "soft" max for the number range slider. */
    /* This is used for columns with type 'number'. */
    max?: number;

    // Additional properties from table-meta.ts
    filterComponentOptions?: {
      title: string;
      options: { label: string; value: string }[];
    };
    enableCsvExport?: boolean; // Default is true, only set to false to disable
    variant?: "default" | "numeric";
    detailUrl?: string;

    // Currency code for currency type columns (e.g. "USD", "EUR")
    currency?: string;
  }
}
