import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import type { Column, ColumnMeta, RowData, Table } from "@tanstack/react-table";
import { useCallback } from "react";
import { uniq } from "../../data-table-array";
import { determineNewOperator } from "../operators/operator-utils";
import { isColumnOptionArray } from "../utils/type-guards";
import type { ColumnOption, ElementType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { MultiOptionItem } from "./multi-option-item";

interface PropertyFilterMultiOptionValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

export function PropertyFilterMultiOptionValueMenu<
  TData extends RowData,
  TValue,
>({
  id,
  column,
  columnMeta,
  table,
}: PropertyFilterMultiOptionValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue() as
    | FilterValue<"multiOption", TData>
    | undefined;

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
      const value = columnMeta.options
        ? columnMeta.options.find((opt) => opt.value === curr)?.value
        : columnMeta.transformOptionFn
          ? columnMeta.transformOptionFn(
              curr as ElementType<NonNullable<TValue>>
            ).value
          : (curr as string);

      if (value) {
        acc[value] = (acc[value] ?? 0) + 1;
      }

      return acc;
    },
    {} as Record<string, number>
  );

  const handleOptionSelect = useCallback(
    (value: string, checked: boolean) => {
      column.setFilterValue(
        (old: undefined | FilterValue<"multiOption", TData>) => {
          if (checked) {
            const newVals = old?.values[0]
              ? [...old.values[0], value]
              : [value];
            const newOperator = determineNewOperator(
              "multiOption",
              old?.values[0] ?? [],
              newVals,
              old?.operator ?? "include"
            );

            return {
              operator: newOperator,
              values: [uniq(newVals)],
            };
          }

          const newVals = old?.values[0]?.filter((v) => v !== value) ?? [];
          const newOperator = determineNewOperator(
            "multiOption",
            old?.values[0] ?? [],
            newVals,
            old?.operator ?? "include"
          );

          if (newVals.length === 0) {
            return undefined;
          }

          return {
            operator: newOperator,
            values: [newVals],
          };
        }
      );
    },
    [column]
  );

  return (
    <Command>
      <CommandInput autoFocus placeholder="Search..." />
      <CommandEmpty>No results.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {options.map((v) => {
            const checked = Boolean(filter?.values[0]?.includes(v.value));
            const count = optionsCount[v.value] ?? 0;

            return (
              <MultiOptionItem
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
