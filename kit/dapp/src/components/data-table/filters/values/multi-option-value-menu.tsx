import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { Column, ColumnMeta, RowData, Table } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { uniq } from "../../data-table-array";
import { determineNewOperator } from "../operators/operator-utils";
import { isColumnOptionArray } from "../utils/type-guards";
import type { ColumnOption, ElementType } from "../types/column-types";
import type { FilterValue } from "../types/filter-types";
import { MultiOptionItem } from "./multi-option-item";

/**
 * Props for the PropertyFilterMultiOptionValueMenu component
 * @template TData - The data type of the table rows
 * @template TValue - The value type of the column
 */
interface PropertyFilterMultiOptionValueMenuProps<TData, TValue> {
  /** Column identifier */
  id: string;
  /** Column instance from TanStack Table */
  column: Column<TData>;
  /** Column metadata containing display and filter configuration */
  columnMeta: ColumnMeta<TData, TValue>;
  /** Table instance from TanStack Table */
  table: Table<TData>;
  /** Callback fired when the menu should close */
  onClose?: () => void;
  /** Callback fired when navigating back to parent menu */
  onBack?: () => void;
}

/**
 * A multi-select filter value menu component that allows users to select multiple
 * options for filtering table data. Supports both static options and dynamically
 * generated options from column data.
 *
 * @template TData - The data type of the table rows (must extend RowData)
 * @template TValue - The value type of the column
 *
 * @example
 * ```tsx
 * <PropertyFilterMultiOptionValueMenu
 *   id="tags"
 *   column={column}
 *   columnMeta={{
 *     type: "multiOption",
 *     options: [
 *       { value: "active", label: "Active" },
 *       { value: "inactive", label: "Inactive" }
 *     ]
 *   }}
 *   table={table}
 * />
 * ```
 */
export function PropertyFilterMultiOptionValueMenu<
  TData extends RowData,
  TValue,
>({
  id,
  column,
  columnMeta,
  table,
  onBack,
}: PropertyFilterMultiOptionValueMenuProps<TData, TValue>) {
  const { t } = useTranslation("data-table");
  const filter = column.getFilterValue() as
    | FilterValue<"multiOption", TData>
    | undefined;

  let options: ColumnOption[];
  const columnVals = table
    .getCoreRowModel()
    .rows.flatMap((r) => r.getValue<TValue>(id))
    .filter((v): v is NonNullable<TValue> => v !== undefined && v !== null);

  // For objects, we need to deduplicate based on their content, not reference
  const uniqueVals =
    columnMeta.transformOptionFn || isColumnOptionArray(columnVals)
      ? (() => {
          const seen = new Set<string | number>();
          const result: NonNullable<TValue>[] = [];
          for (const curr of columnVals) {
            const key = columnMeta.transformOptionFn
              ? columnMeta.transformOptionFn(
                  curr as ElementType<NonNullable<TValue>>
                ).value
              : (curr as unknown as ColumnOption).value;
            if (!seen.has(key)) {
              seen.add(key);
              result.push(curr);
            }
          }
          return result;
        })()
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
    options = (uniqueVals as unknown as ColumnOption[]).filter(
      (option: ColumnOption) => {
        if (seen.has(option.value)) {
          return false;
        }
        seen.add(option.value);
        return true;
      }
    );
  }

  // Invalid configuration
  else {
    throw new Error(
      `[data-table-filter] [${id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`
    );
  }

  const optionsCount: Record<ColumnOption["value"], number> = columnVals.reduce<
    Record<string, number>
  >((acc, curr) => {
    const value = columnMeta.options
      ? columnMeta.options.find((opt) => opt.value === curr)?.value
      : columnMeta.transformOptionFn
        ? columnMeta.transformOptionFn(curr as ElementType<NonNullable<TValue>>)
            .value
        : isColumnOptionArray([curr])
          ? (curr as unknown as ColumnOption).value
          : (curr as string);

    if (value) {
      acc[value] = (acc[value] ?? 0) + 1;
    }

    return acc;
  }, {});

  /**
   * Handles the selection/deselection of an option.
   * Updates the filter value by adding or removing the option from the selected values.
   *
   * @param value - The value of the option being toggled
   * @param checked - Whether the option should be selected or deselected
   */
  const handleOptionSelect = useCallback(
    (value: string, checked: boolean) => {
      column.setFilterValue((old: undefined | FilterValue<"multiOption", TData>) => {
        if (checked) {
          const newVals = old?.values[0] ? [...old.values[0], value] : [value];
          const newOperator = determineNewOperator(
            "multiOption",
            old?.values ?? [],
            [newVals],
            old?.operator ?? "include"
          );

          return {
            operator: newOperator,
            values: [uniq(newVals)],
            columnMeta,
          } satisfies FilterValue<"multiOption", TData>;
        }

        const newVals = old?.values[0]?.filter((v) => v !== value) ?? [];
        const newOperator = determineNewOperator(
          "multiOption",
          old?.values ?? [],
          [newVals],
          old?.operator ?? "include"
        );

        if (newVals.length === 0) {
          return undefined;
        }

        return {
          operator: newOperator,
          values: [newVals],
          columnMeta,
        } satisfies FilterValue<"multiOption", TData>;
      });
    },
    [column, columnMeta]
  );

  const Icon = columnMeta.icon;
  const displayName = columnMeta.displayName ?? "Filter";

  return (
    <Command className="min-w-[280px]">
      {/* Header with field title and icon - match CommandInput styling */}
      <div className="flex h-9 items-center gap-2 border-b px-3">
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
        {Icon && <Icon className="size-4 shrink-0 opacity-50" />}
        <span className="text-sm text-muted-foreground">{displayName}</span>
      </div>
      <CommandInput autoFocus placeholder={t("search")} />
      <CommandEmpty>{t("noResults")}</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {options.map((v, _index) => {
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
