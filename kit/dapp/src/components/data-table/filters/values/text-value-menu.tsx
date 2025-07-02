import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
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
  const [value, setValue] = useState(filter?.values[0] ?? "");

  const handleApply = useCallback(() => {
    if (value.trim() === "") {
      column.setFilterValue(undefined);
    } else {
      // Set the filter value as a simple value for URL serialization
      // The complex filter structure is stored internally
      column.setFilterValue({
        operator,
        values: [value],
        columnMeta: column.columnDef.meta,
      } satisfies FilterValue<"text", TData>);
    }
  }, [column, operator, value]);

  const handleClear = useCallback(() => {
    setValue("");
    column.setFilterValue(undefined);
  }, [column]);

  const handleContainsClick = useCallback(() => {
    setOperator("contains");
  }, []);

  const handleDoesNotContainClick = useCallback(() => {
    setOperator("does not contain");
  }, []);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleApply();
      }
    },
    [handleApply]
  );

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
            <Input
              value={value}
              onChange={handleValueChange}
              placeholder="Type to search..."
              className="w-full mt-1"
              onKeyDown={handleKeyDown}
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                className="flex-1"
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
