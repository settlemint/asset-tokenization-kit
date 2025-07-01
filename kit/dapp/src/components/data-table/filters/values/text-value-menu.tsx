import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DebouncedInput } from "../debounced-input";
import type { FilterValue, TextFilterOperator } from "../types/filter-types";

interface PropertyFilterTextValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
}

export function PropertyFilterTextValueMenu<TData, TValue>({
  column,
}: PropertyFilterTextValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;

  const [operator, setOperator] = useState<TextFilterOperator>(
    filter?.operator ?? "contains"
  );

  const changeText = useCallback(
    (value: string | number) => {
      column.setFilterValue((old: undefined | FilterValue<"text", TData>) => {
        if (!old || old.values.length === 0)
          return {
            operator,
            values: [String(value)],
            columnMeta: column.columnDef.meta,
          } satisfies FilterValue<"text", TData>;
        return { operator, values: [String(value)] };
      });
    },
    [column, operator]
  );

  const handleOperatorChange = useCallback(
    (newOperator: TextFilterOperator) => {
      setOperator(newOperator);
      column.setFilterValue((old: undefined | FilterValue<"text", TData>) => {
        if (!old || old.values.length === 0) return undefined;
        return {
          ...old,
          operator: newOperator,
        };
      });
    },
    [column]
  );

  const handleContainsClick = useCallback(() => {
    handleOperatorChange("contains");
  }, [handleOperatorChange]);

  const handleDoesNotContainClick = useCallback(() => {
    handleOperatorChange("does not contain");
  }, [handleOperatorChange]);

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col gap-2 p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={operator === "contains" ? "default" : "outline"}
                size="sm"
                onClick={handleContainsClick}
                className="text-xs"
              >
                Contains
              </Button>
              <Button
                variant={
                  operator === "does not contain" ? "default" : "outline"
                }
                size="sm"
                onClick={handleDoesNotContainClick}
                className="text-xs"
              >
                Does not contain
              </Button>
            </div>
            <DebouncedInput
              value={filter?.values[0] ?? ""}
              onChange={changeText}
              placeholder="Type to search..."
              className="w-full mt-1"
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
