import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate, formatDateRange } from "@/lib/utils/date";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import { cloneElement, isValidElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { take, uniq } from "../../data-table-array";
import type { ColumnOption, ElementType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { isColumnOptionArray } from "../utils/type-guards";
import { PropertyFilterValueMenu } from "./value-menu";

interface PropertyFilterValueDisplayProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

/**
 * Controls the filter value display and interaction menu for a column.
 * This component provides a dropdown interface for setting filter values
 * based on the column's data type.
 *
 * @param props - Component props
 * @param props.id - The column identifier
 * @param props.column - The table column instance from TanStack Table
 * @param props.columnMeta - Column metadata containing type and configuration
 * @param props.table - The table instance for accessing row data
 *
 * @remarks
 * The component consists of:
 * - A button that displays the current filter value(s)
 * - A popover menu with value input controls specific to the column type
 * - Handles opening/closing state and prevents unwanted closures
 *
 * @example
 * ```tsx
 * <PropertyFilterValueController
 *   id="price"
 *   column={column}
 *   columnMeta={{ type: 'number', displayName: 'Price', min: 0, max: 1000 }}
 *   table={table}
 * />
 * ```
 */
export function PropertyFilterValueController<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  const handleInteractOutside = useCallback(
    (e: { target: unknown; preventDefault: () => void }) => {
      // Prevent closing when clicking inside the menu
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]')) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor className="h-full" />
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs font-normal"
        >
          <PropertyFilterValueDisplay
            id={id}
            column={column}
            columnMeta={columnMeta}
            table={table}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-fit p-0 origin-(--radix-popover-content-transform-origin)"
        onInteractOutside={handleInteractOutside}
        data-testid="value-menu"
      >
        <PropertyFilterValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Displays the current filter value(s) in a human-readable format.
 * Delegates to type-specific display components based on column type.
 *
 * @param props - Component props
 * @param props.id - The column identifier
 * @param props.column - The table column instance
 * @param props.columnMeta - Column metadata containing type information
 * @param props.table - The table instance
 * @returns The appropriate value display component or null if type is not recognized
 *
 * @remarks
 * Supported column types:
 * - option: Single select display
 * - multiOption: Multi-select display with icons and counts
 * - date: Date or date range display
 * - text: Text value display
 * - number: Number or number range display
 */
export function PropertyFilterValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
    case "status":
      return (
        <PropertyFilterOptionValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "date":
      return (
        <PropertyFilterDateValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "text":
      return (
        <PropertyFilterTextValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberValueDisplay
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
        />
      );
    default:
      return null;
  }
}

/**
 * Displays the selected option value(s) for single-select columns.
 * Shows icon and label for single selection, or icons + count for multiple.
 *
 * @param props - Component props
 * @param props.id - The column identifier
 * @param props.column - The table column instance
 * @param props.columnMeta - Column metadata with options configuration
 * @param props.table - The table instance for accessing row data
 *
 * @remarks
 * Display logic:
 * - Single selection: Shows icon (if available) and label
 * - Multiple selections: Shows up to 3 icons and count of selected items
 * - Dynamically generates options from column data if not statically provided
 */
export function PropertyFilterOptionValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);

  // For objects, we need to deduplicate based on their content, not reference
  const uniqueVals =
    columnMeta.transformOptionFn || isColumnOptionArray(columnVals)
      ? columnVals.reduce<NonNullable<TValue>[]>((acc, curr) => {
          const key = columnMeta.transformOptionFn
            ? columnMeta.transformOptionFn(
                curr as ElementType<NonNullable<TValue>>
              ).value
            : (curr as unknown as ColumnOption).value;
          const exists = acc.some((item) => {
            const itemKey = columnMeta.transformOptionFn
              ? columnMeta.transformOptionFn(
                  item as ElementType<NonNullable<TValue>>
                ).value
              : (item as unknown as ColumnOption).value;
            return itemKey === key;
          });
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, [])
      : uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    // Deduplicate by value property since uniq() doesn't work with objects
    const seen = new Set<string>();
    options = (uniqueVals as ColumnOption[]).filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }
      seen.add(option.value);
      return true;
    });
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"option", TData>;
  const selected = options.filter((o) => filter?.values?.includes(o.value));

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const selectedOption = selected[0];
    if (!selectedOption) return null;
    const { label, icon: Icon } = selectedOption;
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="size-3.5 text-primary" />
          ))}
        <span>{label}</span>
      </span>
    );
  }
  const name = (columnMeta.displayName ?? "item").toLowerCase();
  const pluralName = name.endsWith("s") ? `${name}es` : `${name}s`;

  const hasOptionIcons = options.every((o) => o.icon);

  return (
    <div
      className="inline-flex items-center gap-0.5 text-xs"
      data-testid="option-value-display"
    >
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }, index) => {
          if (!icon) return null;
          const Icon = icon;
          return isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon key={`${value}-${index}`} className="size-3.5" />
          );
        })}
      <span className={cn(hasOptionIcons && "ml-1.5")}>
        {selected.length} {pluralName}
      </span>
    </div>
  );
}

/**
 * Displays the selected option value(s) for multi-select columns.
 * Similar to PropertyFilterOptionValueDisplay but handles array values.
 *
 * @param props - Component props
 * @param props.id - The column identifier
 * @param props.column - The table column instance
 * @param props.columnMeta - Column metadata with options configuration
 * @param props.table - The table instance for accessing row data
 *
 * @remarks
 * Display logic:
 * - Single selection: Shows icon (if available) and label
 * - Multiple selections: Shows up to 3 icons and count of selected items
 * - Supports both static options and dynamic generation from data
 */
export function PropertyFilterMultiOptionValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);

  // For objects, we need to deduplicate based on their content, not reference
  const uniqueVals =
    columnMeta.transformOptionFn || isColumnOptionArray(columnVals)
      ? columnVals.reduce<NonNullable<TValue>[]>((acc, curr) => {
          const key = columnMeta.transformOptionFn
            ? columnMeta.transformOptionFn(
                curr as ElementType<NonNullable<TValue>>
              ).value
            : (curr as unknown as ColumnOption).value;
          const exists = acc.some((item) => {
            const itemKey = columnMeta.transformOptionFn
              ? columnMeta.transformOptionFn(
                  item as ElementType<NonNullable<TValue>>
                ).value
              : (item as unknown as ColumnOption).value;
            return itemKey === key;
          });
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, [])
      : uniq(columnVals);

  // If static options are provided, use them
  if (columnMeta.options) {
    options = columnMeta.options;
  }

  // No static options provided,
  // We should dynamically generate them based on the column data
  else if (columnMeta.transformOptionFn) {
    const transformOptionFn = columnMeta.transformOptionFn;

    options = uniqueVals.map((v) =>
      transformOptionFn(v as ElementType<NonNullable<TValue>>)
    );
  }

  // Make sure the column data conforms to ColumnOption type
  else if (isColumnOptionArray(uniqueVals)) {
    // Deduplicate by value property since uniq() doesn't work with objects
    const seen = new Set<string>();
    options = (uniqueVals as ColumnOption[]).filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }
      seen.add(option.value);
      return true;
    });
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"multiOption", TData>;
  const selected = options.filter((o) =>
    filter?.values?.[0]?.includes(o.value)
  );

  if (selected.length === 1) {
    const selectedOption = selected[0];
    if (!selectedOption) return null;
    const { label, icon: Icon } = selectedOption;
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        {hasIcon &&
          (isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="size-3.5 text-primary" />
          ))}

        <span>{label}</span>
      </span>
    );
  }

  const name = (columnMeta.displayName ?? "item").toLowerCase();

  const hasOptionIcons = columnMeta.options?.every((o) => o.icon) ?? false;

  return (
    <div
      className="inline-flex items-center gap-1.5 text-xs"
      data-testid="multi-option-value-display"
    >
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {take(selected, 3).map(({ value, icon }, index) => {
            if (!icon) return null;
            const Icon = icon;
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: `${value}-${index}` })
            ) : (
              <Icon key={`${value}-${index}`} className="size-3.5" />
            );
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  );
}

/**
 * Displays the selected date value(s) for date columns.
 * Formats single dates or date ranges using locale-aware formatting.
 *
 * @param props - Component props
 * @param props.column - The table column instance containing filter value
 *
 * @remarks
 * Display formats:
 * - Single date: "MMM d, yyyy" (e.g., "Jan 15, 2024")
 * - Date range: Custom range format (e.g., "Jan 15 - Feb 20, 2024")
 * - Empty/no value: Shows ellipsis icon
 */
export function PropertyFilterDateValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"date", TData>)
    : undefined;

  if (!filter)
    return (
      <span className="text-xs" data-testid="date-value-display">
        empty
      </span>
    );
  if (filter.values.length === 0)
    return <Ellipsis className="size-3.5" data-testid="date-value-display" />;
  if (filter.values.length === 1) {
    const value = filter.values[0];
    if (!value)
      return <Ellipsis className="size-3.5" data-testid="date-value-display" />;
    const formattedDateStr = formatDate(value, "MMM d, yyyy", locale);

    return (
      <span className="text-xs" data-testid="date-value-display">
        {formattedDateStr}
      </span>
    );
  }

  const firstValue = filter.values[0];
  const secondValue = filter.values[1];
  if (!firstValue || !secondValue)
    return <Ellipsis className="size-3.5" data-testid="date-value-display" />;

  const formattedRangeStr = formatDateRange(firstValue, secondValue, locale);

  return (
    <span className="text-xs" data-testid="date-value-display">
      {formattedRangeStr}
    </span>
  );
}

/**
 * Displays the text filter value for text columns.
 * Shows the exact text being filtered or an ellipsis if empty.
 *
 * @param props - Component props
 * @param props.column - The table column instance containing filter value
 *
 * @remarks
 * - Shows "empty" if no filter is set
 * - Shows ellipsis icon if filter value is empty string
 * - Otherwise shows the filter text value
 */
export function PropertyFilterTextValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;
  if (!filter)
    return (
      <span className="text-xs" data-testid="text-value-display">
        empty
      </span>
    );

  if (typeof filter === "string") {
    return (
      <span className="text-xs" data-testid="text-value-display">
        {filter}
      </span>
    );
  }

  if (
    !Array.isArray(filter.values) ||
    filter.values.length === 0 ||
    filter.values[0]?.trim() === ""
  )
    return <Ellipsis className="size-3.5" data-testid="text-value-display" />;

  const value = filter.values[0];

  return (
    <span className="text-xs" data-testid="text-value-display">
      {value}
    </span>
  );
}

/**
 * Displays the number filter value(s) for number columns.
 * Formats single values or ranges with proper number formatting.
 *
 * @param props - Component props
 * @param props.column - The table column instance containing filter value
 * @param props.columnMeta - Column metadata containing max value constraints
 *
 * @remarks
 * Display formats:
 * - Single value: Shows the number with tabular formatting
 * - Range (is between): Shows "X and Y" with infinity handling
 * - Handles max value capping (shows as "X+" when at or above max)
 * - Uses tabular-nums for consistent number alignment
 */
export function PropertyFilterNumberValueDisplay<TData, TValue>({
  column,
  columnMeta,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max;
  const cappedMax = maxFromMeta ?? 2_147_483_647;

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"number", TData>)
    : undefined;

  if (!filter)
    return (
      <span className="text-xs" data-testid="number-value-display">
        empty
      </span>
    );

  if (typeof filter === "string") {
    return (
      <span className="text-xs" data-testid="number-value-display">
        {filter}
      </span>
    );
  }

  if (
    filter.operator === "is between" ||
    filter.operator === "is not between"
  ) {
    const minValue = filter.values[0];
    const maxValue =
      filter.values[1] === Number.POSITIVE_INFINITY ||
      (filter.values[1] ?? 0) >= cappedMax
        ? `${String(cappedMax)}+`
        : filter.values[1];

    return (
      <span
        className="text-xs tabular-nums tracking-tight"
        data-testid="number-value-display"
      >
        {minValue} and {maxValue}
      </span>
    );
  }

  const value = filter.values[0];
  return (
    <span
      className="text-xs tabular-nums tracking-tight"
      data-testid="number-value-display"
    >
      {value}
    </span>
  );
}
