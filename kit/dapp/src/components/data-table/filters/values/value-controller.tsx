"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { getDateLocale } from "@/lib/utils/date-locale";
import { formatDateRange } from "../date-utils";
import { useTranslation } from "react-i18next";
import { Ellipsis } from "lucide-react";
import { cloneElement, isValidElement, useState, useCallback } from "react";
import { take, uniq } from "../../data-table-array";
import { isColumnOptionArray } from "../utils/type-guards";
import type { ColumnOption, ElementType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { PropertyFilterValueMenu } from "./value-menu";

interface PropertyFilterValueDisplayProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

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

export function PropertyFilterValueDisplay<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
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
  const uniqueVals = uniq(columnVals);

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
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"option", TData>;
  const selected = options.filter((o) => filter.values.includes(o.value));

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
    <div className="inline-flex items-center gap-0.5 text-xs">
      {hasOptionIcons &&
        take(selected, 3).map(({ value, icon }) => {
          if (!icon) return null;
          const Icon = icon;
          return isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon key={value} className="size-3.5" />
          );
        })}
      <span className={cn(hasOptionIcons && "ml-1.5")}>
        {selected.length} {pluralName}
      </span>
    </div>
  );
}

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
  const uniqueVals = uniq(columnVals);

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
    options = uniqueVals;
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const filter = column.getFilterValue() as FilterValue<"multiOption", TData>;
  const selected = options.filter((o) => filter.values[0]?.includes(o.value));

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
    <div className="inline-flex items-center gap-1.5 text-xs">
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {take(selected, 3).map(({ value, icon }) => {
            if (!icon) return null;
            const Icon = icon;
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: value })
            ) : (
              <Icon key={value} className="size-3.5" />
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

export function PropertyFilterDateValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"date", TData>)
    : undefined;

  if (!filter) return <span className="text-xs">empty</span>;
  if (filter.values.length === 0) return <Ellipsis className="size-3.5" />;
  if (filter.values.length === 1) {
    const value = filter.values[0];
    if (!value) return <Ellipsis className="size-3.5" />;
    const dateLocale = getDateLocale(locale);
    const formattedDateStr = formatDate(value, "MMM d, yyyy", {
      locale: dateLocale,
    });

    return <span className="text-xs">{formattedDateStr}</span>;
  }

  const firstValue = filter.values[0];
  const secondValue = filter.values[1];
  if (!firstValue || !secondValue) return <Ellipsis className="size-3.5" />;

  const formattedRangeStr = formatDateRange(firstValue, secondValue, locale);

  return <span className="text-xs">{formattedRangeStr}</span>;
}

export function PropertyFilterTextValueDisplay<TData, TValue>({
  column,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;

  if (!filter) return <span className="text-xs">empty</span>;
  if (filter.values.length === 0 || filter.values[0]?.trim() === "")
    return <Ellipsis className="size-3.5" />;

  const value = filter.values[0];

  return <span className="text-xs">{value}</span>;
}

export function PropertyFilterNumberValueDisplay<TData, TValue>({
  column,
  columnMeta,
}: PropertyFilterValueDisplayProps<TData, TValue>) {
  const maxFromMeta = columnMeta.max;
  const cappedMax = maxFromMeta ?? 2147483647;

  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"number", TData>)
    : undefined;

  if (!filter) return <span className="text-xs">empty</span>;

  if (
    filter.operator === "is between" ||
    filter.operator === "is not between"
  ) {
    const minValue = filter.values[0];
    const maxValue =
      filter.values[1] === Number.POSITIVE_INFINITY ||
      (filter.values[1] ?? 0) >= cappedMax
        ? `${cappedMax}+`
        : filter.values[1];

    return (
      <span className="text-xs tabular-nums tracking-tight">
        {minValue} and {maxValue}
      </span>
    );
  }

  const value = filter.values[0];
  return <span className="text-xs tabular-nums tracking-tight">{value}</span>;
}
