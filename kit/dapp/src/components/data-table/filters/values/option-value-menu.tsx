import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { uniq } from "../../data-table-array";
import { isColumnOptionArray } from "../utils/type-guards";
import type { ColumnOption, ElementType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { OptionItem } from "./option-item";

interface PropertyFilterOptionValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
  onClose?: () => void;
  onBack?: () => void;
}

export function PropertyFilterOptionValueMenu<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
  onBack,
}: PropertyFilterOptionValueMenuProps<TData, TValue>) {
  const { t } = useTranslation("general");
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"option", TData>)
    : undefined;

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

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce(
    (acc, curr) => {
      const { value } = columnMeta.transformOptionFn
        ? columnMeta.transformOptionFn(curr as ElementType<NonNullable<TValue>>)
        : { value: curr as string };

      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleOptionSelect = useCallback(
    (value: string, checked: boolean) => {
      column.setFilterValue(() => {
        if (checked) {
          return {
            operator: "is",
            values: [value],
          };
        }

        return undefined;
      });
    },
    [column]
  );

  const Icon = columnMeta.icon;
  const displayName = columnMeta.displayName ?? "Filter";

  return (
    <Command loop className="min-w-[280px]">
      {/* Header with field title and icon */}
      <div className="flex items-center gap-1 px-3 py-1 border-b">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent -ml-1"
            onClick={onBack}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        )}
        {Icon && <Icon className="size-3 text-muted-foreground" />}
        <span className="text-xs text-muted-foreground">{displayName}</span>
      </div>
      <CommandInput autoFocus placeholder={t("components.data-table.search")} />
      <CommandEmpty>{t("components.data-table.no-results")}</CommandEmpty>
      <CommandList className="max-h-fit">
        <CommandGroup>
          {options.map((v) => {
            // Determine checked state based ONLY on the first value when operator is 'is'
            const checked = Boolean(
              filter?.operator === "is" && filter.values[0] === v.value
            );
            const count = optionsCount[v.value] ?? 0;

            return (
              <OptionItem
                key={v.value}
                option={v}
                checked={checked}
                count={count}
                onSelect={handleOptionSelect}
              />
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
