import type { RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ColumnDataType, ColumnOption, ElementType } from "./column-types";

/**
 * Module augmentation for @tanstack/react-table to add custom column metadata
 * @module table-extensions
 */
declare module "@tanstack/react-table" {
  /**
   * Extended metadata interface for table columns
   *
   * This interface augments the default ColumnMeta from TanStack Table to include
   * additional properties for enhanced column configuration, filtering, sorting,
   * and display customization.
   *
   * @template TData - The type of data in the table rows
   * @template TValue - The type of value for this specific column
   *
   * @example
   * ```typescript
   * const columns: ColumnDef<MyData>[] = [{
   *   accessorKey: 'amount',
   *   meta: {
   *     displayName: 'Total Amount',
   *     type: 'currency',
   *     currency: 'USD',
   *     variant: 'numeric'
   *   }
   * }];
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * Custom display name for the column header
     * @remarks If not provided, the column ID will be used as fallback
     */
    displayName?: string;

    /**
     * Icon to display in the column header
     * @remarks Can be either a Lucide icon or a custom React component that accepts className prop
     */
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;

    /**
     * Data type of the column for appropriate formatting and filtering
     * @remarks Can be a predefined ColumnDataType or any string for custom types
     * Common types include: 'text', 'number', 'date', 'currency', 'option', 'multiOption'
     */
    type?: ColumnDataType | (string & {});

    /**
     * Predefined options for select/multiselect column types
     * @remarks Used when column type is 'option' or 'multiOption'
     * If not provided, options will be dynamically generated from the data
     * @see {@link ColumnOption} for the structure of option objects
     */
    options?: ColumnOption[];

    /**
     * Transform function to convert raw values into ColumnOption objects
     * @param value - The raw value from the data
     * @returns A formatted ColumnOption object
     * @remarks Only applicable for 'option' or 'multiOption' column types
     * Used when options need to be dynamically generated from data
     */
    transformOptionFn?: (
      value: ElementType<NonNullable<TValue>>
    ) => ColumnOption;

    /**
     * Maximum value for numeric range filters
     * @remarks Only applicable for columns with type 'number'
     * This is a "soft" maximum - actual data may exceed this value
     * Used to set the upper bound of range slider filters
     */
    max?: number;

    /**
     * Custom filter component configuration
     * @remarks Allows specifying a custom filter UI with predefined options
     * Useful for columns that need specialized filter interfaces
     */
    filterComponentOptions?: {
      /** Title displayed in the filter UI */
      title: string;
      /** Available filter options */
      options: { label: string; value: string }[];
    };
    /**
     * Controls whether this column is included in CSV exports
     * @defaultValue true
     * @remarks Set to false to exclude sensitive or internal columns from exports
     */
    enableCsvExport?: boolean;
    /**
     * Visual variant for column rendering
     * @remarks
     * - 'default': Standard left-aligned text
     * - 'numeric': Right-aligned for numerical values
     */
    variant?: "default" | "numeric";
    /**
     * URL pattern for navigating to row details
     * @remarks Can include placeholders that will be replaced with row data
     * @example "/items/{id}" where {id} is replaced with the row's ID value
     */
    detailUrl?: string;

    /**
     * ISO 4217 currency code for currency formatting
     * @remarks Only applicable when column type is 'currency'
     * @example "USD", "EUR", "GBP", "JPY"
     */
    currency?: string;

    /**
     * Value to display when the cell value is empty/null/undefined
     * @remarks Can be a string, number, or React component
     * @example "-", "N/A", <span className="text-muted-foreground">No data</span>
     */
    emptyValue?: React.ReactNode;

    /**
     * Whether to show pretty name for addresses (only applies when type="address")
     * @remarks When true, will display the ENS name or other readable identifier if available
     * @defaultValue true
     */
    showPrettyName?: boolean;
  }
}
