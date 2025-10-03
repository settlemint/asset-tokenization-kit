import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Configuration options for data table pagination.
 */
export interface DataTablePaginationOptions {
  /** Whether to enable pagination controls. Defaults to true. */
  enablePagination?: boolean;
  /** Total number of items across all pages (for server-side pagination) */
  totalCount?: number;
}

/**
 * Props for the DataTablePagination component.
 * @template TData The type of data in the table
 */
interface DataTablePaginationProps<TData> extends DataTablePaginationOptions {
  /** The table instance from TanStack Table */
  table: Table<TData>;
}

/**
 * Renders pagination controls for a data table including page size selector and navigation buttons.
 * Provides accessible pagination with keyboard navigation support.
 *
 * @template TData The type of data in the table
 * @param props The component props
 * @param props.table The TanStack table instance
 * @param props.enablePagination Whether to render pagination controls. Defaults to true
 * @returns The pagination component or null if pagination is disabled
 *
 * @example
 * ```tsx
 * <DataTablePagination
 *   table={table}
 *   enablePagination={true}
 * />
 * ```
 */
export function DataTablePagination<TData>({
  table,
  enablePagination = true,
  totalCount,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation("data-table");

  /**
   * Handles page size selection changes.
   * @param value The new page size as a string
   */
  const handlePageSizeChange = useCallback(
    (value: string) => {
      table.setPageSize(Number(value));
    },
    [table]
  );

  /**
   * Navigates to the first page of results.
   */
  const handleFirstPage = useCallback(() => {
    table.setPageIndex(0);
  }, [table]);

  /**
   * Navigates to the previous page of results.
   */
  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  /**
   * Navigates to the next page of results.
   */
  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  /**
   * Navigates to the last page of results.
   */
  const handleLastPage = useCallback(() => {
    table.setPageIndex(table.getPageCount() - 1);
  }, [table]);

  if (!enablePagination) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex-1 text-xs">
        <div className="text-muted-foreground">
          {table.getAllColumns().some((column) => column.id === "select") &&
          table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <span>
              {t("selectedRowsInfo", {
                selected: table.getFilteredSelectedRowModel().rows.length,
                total: table.getFilteredRowModel().rows.length,
              })}
            </span>
          ) : (
            totalCount !== undefined && (
              <span className="tabular-nums">
                {t("totalItems", { count: totalCount })}
              </span>
            )
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs">{t("rowsPerPage")}</p>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-6 w-[65px] text-xs px-2 py-1">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="max-h-[200px]">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={String(pageSize)}
                  className="text-xs"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-7 w-7 p-0 lg:flex transition-transform transition-background duration-200 hover:bg-muted/50 active:scale-95"
            onClick={handleFirstPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("goToFirstPage")}</span>
            <ChevronsLeft className="h-3.5 w-3.5 transition-transform duration-200 hover:-translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 transition-all duration-200 hover:bg-muted/50 active:scale-95"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("goToPreviousPage")}</span>
            <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-200 hover:-translate-x-0.5" />
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground text-xs px-2 tabular-nums">
            <span className="transition-all duration-200">
              {String(table.getState().pagination.pageIndex + 1)}
            </span>
            <span>/</span>
            <span className="transition-all duration-200">
              {String(table.getPageCount())}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 transition-all duration-200 hover:bg-muted/50 active:scale-95"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("goToNextPage")}</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-7 w-7 p-0 lg:flex transition-all duration-200 hover:bg-muted/50 active:scale-95"
            onClick={handleLastPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("goToLastPage")}</span>
            <ChevronsRight className="h-3.5 w-3.5 transition-transform duration-200 hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
