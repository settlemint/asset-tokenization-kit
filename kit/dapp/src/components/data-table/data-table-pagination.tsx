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
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-muted-foreground text-sm">
        {table.getAllColumns().some((column) => column.id === "select") && (
          <span>
            {t("components.data-table.selected-rows-info", {
              selected: table.getFilteredSelectedRowModel().rows.length,
              total: table.getFilteredRowModel().rows.length,
            })}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-muted-foreground text-sm">
            {t("components.data-table.rows-per-page")}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px] border-muted-foreground">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center font-medium text-muted-foreground text-sm">
          {t("components.data-table.page-info", {
            current: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount(),
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 border-muted-foreground p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-first-page")}
            </span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8 border-muted-foreground p-0"
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-previous-page")}
            </span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8 border-muted-foreground p-0"
            onClick={handleNextPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-next-page")}
            </span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 border-muted-foreground p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              {t("components.data-table.go-to-last-page")}
            </span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
