"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

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

export interface DataTablePaginationOptions {
  enablePagination?: boolean;
}

interface DataTablePaginationProps<TData> extends DataTablePaginationOptions {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
  enablePagination = true,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation("general");

  const handlePageSizeChange = useCallback(
    (value: string) => {
      table.setPageSize(Number(value));
    },
    [table]
  );

  const handleFirstPage = useCallback(() => {
    table.setPageIndex(0);
  }, [table]);

  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  const handleLastPage = useCallback(() => {
    table.setPageIndex(table.getPageCount() - 1);
  }, [table]);

  if (!enablePagination) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex-1 text-muted-foreground text-xs">
        {table.getAllColumns().some((column) => column.id === "select") &&
          table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {t("components.data-table.selected-rows-info", {
                selected: table.getFilteredSelectedRowModel().rows.length,
                total: table.getFilteredRowModel().rows.length,
              })}
            </span>
          )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs">
            {t("components.data-table.rows-per-page")}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-6 w-[65px] text-xs px-2 py-1">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="max-h-[200px]">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
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
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-first-page")}
            </span>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-previous-page")}
            </span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground text-xs px-2">
            <span>{table.getState().pagination.pageIndex + 1}</span>
            <span>/</span>
            <span>{table.getPageCount()}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-next-page")}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-7 w-7 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-last-page")}
            </span>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
