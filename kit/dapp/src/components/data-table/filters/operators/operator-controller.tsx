import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createLogger } from "@settlemint/sdk-utils/logging";
import type { Column, ColumnMeta } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColumnDataType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { dateFilterDetails } from "./date-operators";
import { multiOptionFilterDetails } from "./multi-option-operators";
import { numberFilterDetails } from "./number-operators";
import { filterTypeOperatorDetails } from "./operator-mapping";
import { optionFilterDetails } from "./option-operators";
import { textFilterDetails } from "./text-operators";

const logger = createLogger();

/**
 * Renders the filter operator display and menu for a given column filter.
 * This component provides a dropdown interface for selecting filter operators
 * based on the column's data type.
 *
 * @param props - Component props
 * @param props.column - The table column instance from TanStack Table
 * @param props.columnMeta - Column metadata containing type and other configuration
 * @param props.filter - The current filter value with operator and values
 *
 * @remarks
 * The component consists of:
 * - A button that displays the current operator
 * - A popover menu with operator options specific to the column type
 * - Automatic focus management and keyboard navigation
 *
 * @example
 * ```tsx
 * <PropertyFilterOperatorController
 *   column={column}
 *   columnMeta={{ type: 'number', displayName: 'Price' }}
 *   filter={{ operator: 'is between', values: [10, 100] }}
 * />
 * ```
 */
export function PropertyFilterOperatorController<
  TData,
  T extends ColumnDataType,
>({
  column,
  columnMeta,
  filter,
}: {
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, unknown>;
  filter: FilterValue<T, TData>;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation("data-table");

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs"
        >
          <PropertyFilterOperatorDisplay
            filter={filter}
            filterType={columnMeta.type as ColumnDataType}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-fit p-0 origin-(--radix-popover-content-transform-origin)"
      >
        <Command loop>
          <CommandInput placeholder={t("search")} />
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          <CommandList className="max-h-fit">
            <PropertyFilterOperatorMenu
              column={column}
              closeController={close}
            />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Displays the current filter operator in a human-readable format.
 *
 * @param props - Component props
 * @param props.filter - The filter value containing the operator to display
 * @param props.filterType - The column data type to determine operator display
 * @returns A span element with the operator label
 *
 * @example
 * ```tsx
 * <PropertyFilterOperatorDisplay
 *   filter={{ operator: 'is between', values: [10, 100] }}
 *   filterType="number"
 * />
 * // Renders: <span className="text-xs">is between</span>
 * ```
 */
export function PropertyFilterOperatorDisplay<TData, T extends ColumnDataType>({
  filter,
  filterType,
}: {
  filter: FilterValue<T, TData>;
  filterType: T;
}) {
  const operatorDetails = filterTypeOperatorDetails[filterType];
  const details = operatorDetails?.[filter.operator];

  if (!details) {
    logger.warn(
      `Unknown operator "${filter.operator}" for filter type "${filterType}"`
    );
    return <span className="text-xs">{filter.operator}</span>;
  }

  return <span className="text-xs">{details.label}</span>;
}

interface PropertyFilterOperatorMenuProps<TData> {
  column: Column<TData>;
  closeController: () => void;
}

/**
 * Renders the appropriate operator menu based on the column's data type.
 * This component acts as a router that delegates to type-specific operator menus.
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 * @returns The appropriate operator menu component or null if type is not recognized
 *
 * @remarks
 * Supported column types:
 * - option: Single select operators (is, is not)
 * - multiOption: Multi-select operators (include, exclude, include all, etc.)
 * - date: Date operators (is, is not, is before, is after, etc.)
 * - text: Text operators (contains, starts with, ends with, etc.)
 * - number: Number operators (is, is not, is greater than, etc.)
 */
export function PropertyFilterOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const meta = column.columnDef.meta;
  if (!meta?.type) return null;
  const { type } = meta;

  switch (type) {
    case "option":
    case "status":
      return (
        <PropertyFilterOptionOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "date":
      return (
        <PropertyFilterDateOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "text":
      return (
        <PropertyFilterTextOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberOperatorMenu
          column={column}
          closeController={closeController}
        />
      );
    default:
      return null;
  }
}

/**
 * Helper component for rendering individual operator menu items.
 * Provides consistent behavior for all operator menu items.
 *
 * @param props - Component props
 * @param props.value - The operator value to set when selected
 * @param props.label - The display label for the operator
 * @param props.onSelect - Callback when the operator is selected
 *
 * @internal
 */
function PropertyFilterOperatorMenuItem({
  value,
  label,
  onSelect,
}: {
  value: string;
  label: string;
  onSelect: (value: string) => void;
}) {
  const handleSelect = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <CommandItem onSelect={handleSelect} value={value}>
      {label}
    </CommandItem>
  );
}

/**
 * Operator menu for single-select option columns.
 * Displays operators like "is" and "is not".
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 *
 * @internal
 */
function PropertyFilterOptionOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"option", TData>;
  const filterDetails = optionFilterDetails[filter.operator];

  const relatedFilters = Object.values(optionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = useCallback(
    (operator: string) => {
      column.setFilterValue((old: typeof filter) => ({
        ...old,
        operator,
      }));
      logger.debug(`Setting filter operator for ${column.id} to:`, operator);
      closeController();
    },
    [column, closeController]
  );

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => (
        <PropertyFilterOperatorMenuItem
          key={r.value}
          value={r.value}
          label={r.label}
          onSelect={changeOperator}
        />
      ))}
    </CommandGroup>
  );
}

/**
 * Operator menu for multi-select option columns.
 * Displays operators like "include any of", "exclude", "include all of", etc.
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 *
 * @internal
 */
function PropertyFilterMultiOptionOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const filter = column.getFilterValue() as FilterValue<"multiOption", TData>;
  const filterDetails = multiOptionFilterDetails[filter.operator];

  const relatedFilters = Object.values(multiOptionFilterDetails).filter(
    (o) => o.target === filterDetails.target
  );

  const changeOperator = useCallback(
    (operator: string) => {
      column.setFilterValue((old: typeof filter) => ({
        ...old,
        operator,
      }));
      logger.debug(`Setting filter operator for ${column.id} to:`, operator);
      closeController();
    },
    [column, closeController]
  );

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => (
        <PropertyFilterOperatorMenuItem
          key={r.value}
          value={r.value}
          label={r.label}
          onSelect={changeOperator}
        />
      ))}
    </CommandGroup>
  );
}

/**
 * Operator menu for date columns.
 * Displays operators like "is", "is before", "is after", "is between", etc.
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 *
 * @internal
 */
function PropertyFilterDateOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const relatedFilters = Object.values(dateFilterDetails);

  const changeOperator = useCallback(
    (operator: string) => {
      column.setFilterValue((old: FilterValue<"date", TData>) => ({
        ...old,
        operator,
      }));
      logger.debug(`Setting filter operator for ${column.id} to:`, operator);
      closeController();
    },
    [column, closeController]
  );

  return (
    <CommandGroup>
      {relatedFilters.map((r) => (
        <PropertyFilterOperatorMenuItem
          key={r.value}
          value={r.value}
          label={r.label}
          onSelect={changeOperator}
        />
      ))}
    </CommandGroup>
  );
}

/**
 * Operator menu for text columns.
 * Displays operators like "contains", "starts with", "ends with", etc.
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 */
export function PropertyFilterTextOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const relatedFilters = Object.values(textFilterDetails);

  const changeOperator = useCallback(
    (operator: string) => {
      column.setFilterValue((old: FilterValue<"text", TData>) => ({
        ...old,
        operator,
      }));
      logger.debug(`Setting filter operator for ${column.id} to:`, operator);
      closeController();
    },
    [column, closeController]
  );

  return (
    <CommandGroup heading="Operators">
      {relatedFilters.map((r) => (
        <PropertyFilterOperatorMenuItem
          key={r.value}
          value={r.value}
          label={r.label}
          onSelect={changeOperator}
        />
      ))}
    </CommandGroup>
  );
}

/**
 * Operator menu for number columns.
 * Displays operators like "is", "is greater than", "is less than", "is between", etc.
 *
 * @param props - Component props
 * @param props.column - The table column instance
 * @param props.closeController - Callback to close the menu
 *
 * @internal
 */
function PropertyFilterNumberOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  // Show all related operators
  const relatedFilters = Object.values(numberFilterDetails);

  const changeOperator = useCallback(
    (operator: string) => {
      column.setFilterValue((old: FilterValue<"number", TData>) => ({
        ...old,
        operator,
      }));
      logger.debug(`Setting filter operator for ${column.id} to:`, operator);
      closeController();
    },
    [column, closeController]
  );

  return (
    <div>
      <CommandGroup heading="Operators">
        {relatedFilters.map((r) => (
          <PropertyFilterOperatorMenuItem
            key={r.value}
            value={r.value}
            label={r.label}
            onSelect={changeOperator}
          />
        ))}
      </CommandGroup>
    </div>
  );
}
