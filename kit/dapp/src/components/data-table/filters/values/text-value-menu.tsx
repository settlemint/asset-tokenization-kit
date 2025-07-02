import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FilterValue, TextFilterOperator } from "../types/filter-types";

interface PropertyFilterTextValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
  onClose?: () => void;
}

export function PropertyFilterTextValueMenu<TData, TValue>({
  column,
  columnMeta,
  onClose,
}: PropertyFilterTextValueMenuProps<TData, TValue>) {
  const { t } = useTranslation("general");
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
    onClose?.();
  }, [column, operator, value, onClose]);

  const handleClear = useCallback(() => {
    setValue("");
    column.setFilterValue(undefined);
    onClose?.();
  }, [column, onClose]);

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

  const Icon = columnMeta.icon;
  const displayName = columnMeta.displayName ?? "Filter";

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col gap-2 p-2">
            {/* Header with field title and icon */}
            <div className="flex items-center gap-2 px-1 pb-1">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              <span className="font-medium text-sm">{displayName}</span>
            </div>
            <Separator className="mb-1" />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={operator === "contains" ? "default" : "outline"}
                size="sm"
                onClick={handleContainsClick}
                className="text-xs"
              >
                {t("components.data-table.filters.text.contains")}
              </Button>
              <Button
                variant={
                  operator === "does not contain" ? "default" : "outline"
                }
                size="sm"
                onClick={handleDoesNotContainClick}
                className="text-xs"
              >
                {t("components.data-table.filters.text.does-not-contain")}
              </Button>
            </div>
            <Input
              value={value}
              onChange={handleValueChange}
              placeholder={t("components.data-table.filters.text.placeholder")}
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
                {t("components.data-table.apply")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                {t("components.data-table.clear")}
              </Button>
            </div>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
