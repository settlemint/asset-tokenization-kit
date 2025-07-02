import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { isEqual } from "date-fns";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { FilterValue } from "../types/filter-types";

interface PropertyFilterDateValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
  onClose?: () => void;
  onBack?: () => void;
}

export function PropertyFilterDateValueMenu<TData, TValue>({
  column,
  columnMeta,
  onBack,
}: PropertyFilterDateValueMenuProps<TData, TValue>) {
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"date", TData>)
    : undefined;

  const [date, setDate] = useState<DateRange | undefined>({
    from: filter?.values[0] ?? new Date(),
    to: filter?.values[1] ?? undefined,
  });

  const changeDateRange = useCallback(
    (value: DateRange | undefined) => {
      const start = value?.from;
      const end =
        start && value.to && !isEqual(start, value.to) ? value.to : undefined;

      setDate({ from: start, to: end });

      const isRange = start && end;

      const newValues = isRange ? [start, end] : start ? [start] : [];

      column.setFilterValue((old: undefined | FilterValue<"date", TData>) => {
        if (!old || old.values.length === 0)
          return {
            operator: newValues.length > 1 ? "is between" : "is",
            values: newValues,
            columnMeta: column.columnDef.meta,
          };

        const newOperator =
          old.operator === "is between" && newValues.length <= 1
            ? "is"
            : old.operator === "is" && newValues.length > 1
              ? "is between"
              : old.operator;

        return {
          operator: newOperator,
          values: newValues,
          columnMeta: column.columnDef.meta,
        };
      });
    },
    [column]
  );

  const Icon = columnMeta.icon;
  const displayName = columnMeta.displayName ?? "Filter";

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col space-y-4 p-4 min-w-[280px]">
            {/* Header with field title and icon */}
            <div className="flex items-center gap-1 -mx-2 -mt-2">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={onBack}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              )}
              {Icon && <Icon className="size-3 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{displayName}</span>
            </div>
            <Separator className="-mx-4" />
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={changeDateRange}
              numberOfMonths={1}
            />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
