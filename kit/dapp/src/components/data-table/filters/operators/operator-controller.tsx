"use client";

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
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import type { Column, ColumnMeta } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { dateFilterDetails } from "./date-operators";
import { filterTypeOperatorDetails } from "./operator-mapping";
import { multiOptionFilterDetails } from "./multi-option-operators";
import { numberFilterDetails } from "./number-operators";
import { optionFilterDetails } from "./option-operators";
import { textFilterDetails } from "./text-operators";
import type { ColumnDataType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel | undefined) ?? "info",
});

/****** Property Filter Operator ******/

// Renders the filter operator display and menu for a given column filter
// The filter operator display is the label and icon for the filter operator
// The filter operator menu is the dropdown menu for the filter operator
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
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results.</CommandEmpty>
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

export function PropertyFilterOperatorDisplay<TData, T extends ColumnDataType>({
  filter,
  filterType,
}: {
  filter: FilterValue<T, TData>;
  filterType: T;
}) {
  const operatorDetails = filterTypeOperatorDetails[filterType];
  if (!operatorDetails || !filter?.operator) {
    return <span className="text-xs">is</span>;
  }

  const details = operatorDetails[filter.operator];
  if (!details) {
    return <span className="text-xs">{filter.operator}</span>;
  }

  return <span className="text-xs">{details.label}</span>;
}

interface PropertyFilterOperatorMenuProps<TData> {
  column: Column<TData>;
  closeController: () => void;
}

export function PropertyFilterOperatorMenu<TData>({
  column,
  closeController,
}: PropertyFilterOperatorMenuProps<TData>) {
  const meta = column.columnDef.meta;
  if (!meta?.type) return null;
  const { type } = meta;

  switch (type) {
    case "option":
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

// Helper component for menu items
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
