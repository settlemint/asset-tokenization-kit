import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import { CheckIcon, MinusIcon, XIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface SelectionHeaderProps<TData> {
  table: Table<TData>;
  className?: string;
  showSelectAllButton?: boolean;
  showClearButton?: boolean;
}

/**
 * Selection header with improved visual feedback and accessibility
 */
export function SelectionHeader<TData>({
  table,
  className,
  showSelectAllButton = true,
  showClearButton = true,
}: SelectionHeaderProps<TData>) {
  const { t } = useTranslation("data-table");

  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();
  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getRowModel().rows.length;

  const handleSelectAll = useCallback(() => {
    table.toggleAllPageRowsSelected(true);
  }, [table]);

  const handleClearSelection = useCallback(() => {
    table.toggleAllPageRowsSelected(false);
  }, [table]);

  const handleToggleAll = useCallback(() => {
    table.toggleAllPageRowsSelected();
  }, [table]);

  const selectionState = useMemo(() => {
    if (isAllSelected) return "all";
    if (isSomeSelected) return "some";
    return "none";
  }, [isAllSelected, isSomeSelected]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative flex items-center">
        <Checkbox
          checked={isAllSelected || (isSomeSelected && "indeterminate")}
          onCheckedChange={handleToggleAll}
          aria-label={
            isAllSelected
              ? t("bulkActions.clearSelection")
              : isSomeSelected
                ? `${String(selectedCount)} of ${String(totalCount)} rows selected`
                : t("bulkActions.selectAll")
          }
          className={cn(
            "transition-all duration-200",
            selectionState === "some" && "bg-primary/10 border-primary",
            selectionState === "all" && "bg-primary border-primary"
          )}
        />

        {/* Visual indicator for selection state */}
        {selectionState === "some" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <MinusIcon className="size-3 text-primary" />
          </div>
        )}

        {selectionState === "all" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <CheckIcon className="size-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Additional controls when items are selected */}
      {isSomeSelected && (showSelectAllButton || showClearButton) && (
        <div className="ml-2 flex items-center gap-1">
          {showSelectAllButton && !isAllSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
            >
              {t("bulkActions.selectAll")}
            </Button>
          )}
          {showClearButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-6 w-6 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <XIcon className="size-3" />
              <span className="sr-only">{t("bulkActions.clearSelection")}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface SelectionCellProps {
  row: {
    getIsSelected: () => boolean;
    toggleSelected: (value: boolean) => void;
    index: number;
  };
  className?: string;
  showRowNumber?: boolean;
}

/**
 * Selection cell with better visual feedback
 */
export function SelectionCell({
  row,
  className,
  showRowNumber = false,
}: SelectionCellProps) {
  const { t } = useTranslation("data-table");
  const isSelected = row.getIsSelected();
  const rowIndex = row.index + 1;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative flex items-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={useCallback(
            (value: boolean) => {
              row.toggleSelected(value);
            },
            [row]
          )}
          aria-label={t("bulkActions.selectRow", {
            row: rowIndex,
          })}
          className={cn(
            "transition-all duration-200",
            isSelected && "bg-primary border-primary scale-105"
          )}
        />

        {/* Row number indicator */}
        {showRowNumber && !isSelected && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
            {String(rowIndex)}
          </span>
        )}
      </div>
    </div>
  );
}

interface SelectionSummaryProps {
  selectedCount: number;
  totalCount: number;
  className?: string;
  variant?: "compact" | "detailed";
}

/**
 * Selection summary component for showing selection state
 */
export function SelectionSummary({
  selectedCount,
  totalCount,
  className,
  variant = "compact",
}: SelectionSummaryProps) {
  const { t } = useTranslation("data-table");

  if (selectedCount === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className="flex items-center gap-1">
        <CheckIcon className="size-4 text-primary" />
        <span className="font-medium text-primary">
          {variant === "compact"
            ? selectedCount
            : t("bulkActions.selectedCount", {
                count: selectedCount,
              })}
        </span>
      </div>

      {variant === "detailed" && (
        <>
          <span className="text-muted-foreground">of</span>
          <span className="text-muted-foreground">{String(totalCount)}</span>
          <span className="text-muted-foreground">
            {totalCount === 1 ? "item" : "items"}
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Hook for managing selection state
 */
export function useSelection<TData>(table: Table<TData>) {
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const totalCount = table.getRowModel().rows.length;
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

  const selectionPercentage = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((selectedCount / totalCount) * 100);
  }, [selectedCount, totalCount]);

  const selectedData = useMemo(() => {
    return selectedRows.map((row) => row.original);
  }, [selectedRows]);

  const selectAll = useCallback(() => {
    table.toggleAllRowsSelected(true);
  }, [table]);

  const clearSelection = useCallback(() => {
    table.toggleAllRowsSelected(false);
  }, [table]);

  const invertSelection = useCallback(() => {
    table.getRowModel().rows.forEach((row) => {
      row.toggleSelected(!row.getIsSelected());
    });
  }, [table]);

  return {
    selectedRows,
    selectedCount,
    totalCount,
    isAllSelected,
    isSomeSelected,
    selectionPercentage,
    selectedData,
    selectAll,
    clearSelection,
    invertSelection,
  };
}
