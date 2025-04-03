"use client";
"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";
import { FilterXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTableExport } from "./data-table-export";
import { DataTableFilter } from "./data-table-filter";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableToolbarOptions {
  enableToolbar?: boolean;
}

interface DataTableToolbarProps<TData> extends DataTableToolbarOptions {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  enableToolbar = true,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("components.data-table");
  const hasFilters = table.getState().columnFilters.length > 0;

  function clearFilters() {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  }

  if (!enableToolbar) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <DataTableFilter table={table} />
        {hasFilters && (
          <Button
            variant="destructive"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2"
          >
            <FilterXIcon className="h-4 w-4 mr-1" />
            <span>Clear</span>
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        <DataTableExport table={table} />
      </div>
    </div>
  );
}
