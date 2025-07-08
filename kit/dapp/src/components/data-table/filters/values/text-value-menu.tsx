import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FilterValue, TextFilterOperator } from "../types/filter-types";

/**
 * Props for the PropertyFilterTextValueMenu component
 * @template TData - The data type of the table rows
 * @template TValue - The value type of the column
 */
interface PropertyFilterTextValueMenuProps<TData, TValue> {
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
 * A text filter value menu component that allows users to filter table data
 * by text content. Supports:
 * - "Contains" filtering (case-insensitive)
 * - "Does not contain" filtering
 * - Keyboard shortcuts (Enter to apply)
 *
 * @template TData - The data type of the table rows
 * @template TValue - The value type of the column
 *
 * @example
 * ```tsx
 * <PropertyFilterTextValueMenu
 *   id="name"
 *   column={column}
 *   columnMeta={{
 *     type: "text",
 *     displayName: "Name"
 *   }}
 *   table={table}
 *   onClose={() => setShowMenu(false)}
 * />
 * ```
 */
export function PropertyFilterTextValueMenu<TData, TValue>({
  column,
  columnMeta,
  onClose,
  onBack,
}: PropertyFilterTextValueMenuProps<TData, TValue>) {
  const { t } = useTranslation("data-table");
  const filter = column.getFilterValue()
    ? (column.getFilterValue() as FilterValue<"text", TData>)
    : undefined;

  const [operator, setOperator] = useState<TextFilterOperator>(
    filter?.operator ?? "contains"
  );
  const [value, setValue] = useState(filter?.values[0] ?? "");

  /**
   * Applies the text filter to the column.
   * Clears the filter if the input is empty or only contains whitespace.
   */
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

  /**
   * Clears the filter value and resets the input field.
   */
  const handleClear = useCallback(() => {
    setValue("");
    column.setFilterValue(undefined);
    onClose?.();
  }, [column, onClose]);

  /**
   * Sets the filter operator to "contains".
   */
  const handleContainsClick = useCallback(() => {
    setOperator("contains");
  }, []);

  /**
   * Sets the filter operator to "does not contain".
   */
  const handleDoesNotContainClick = useCallback(() => {
    setOperator("does not contain");
  }, []);

  /**
   * Updates the filter value as the user types.
   *
   * @param e - The input change event
   */
  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  /**
   * Handles keyboard shortcuts in the input field.
   * Applies the filter when Enter is pressed.
   *
   * @param e - The keyboard event
   */
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
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div className="flex flex-col p-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={operator === "contains" ? "default" : "outline"}
                size="sm"
                onClick={handleContainsClick}
                className="text-xs"
              >
                {t("filters.text.contains")}
              </Button>
              <Button
                variant={
                  operator === "does not contain" ? "default" : "outline"
                }
                size="sm"
                onClick={handleDoesNotContainClick}
                className="text-xs"
              >
                {t("filters.text.doesNotContain")}
              </Button>
            </div>
            <Input
              value={value}
              onChange={handleValueChange}
              placeholder={t("filters.text.placeholder")}
              className="w-full"
              onKeyDown={handleKeyDown}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                className="flex-1"
              >
                {t("apply")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                {t("clear")}
              </Button>
            </div>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
