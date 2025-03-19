"use client";
"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTableExport } from "./data-table-export";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
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

  if (!enableToolbar) {
    return null;
  }

  const isFiltered = table.getState().columnFilters.length > 0;

  const facetedColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanFilter())
    .map((column) => ({
      column,
      title: column.columnDef.header?.toString() ?? "",
      options: Array.from(column.getFacetedUniqueValues().entries()).map(
        ([value]) => ({
          label: String(value),
          value: String(value),
          icon: table.options.meta?.icons?.[value],
        })
      ),
    }));

  const globalFilterColumn = table
    .getAllLeafColumns()
    .find((col) => col.getCanGlobalFilter());

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {globalFilterColumn && (
          <Input
            data-testid="data-table-search-input"
            placeholder={t("search")}
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] border-muted-foreground lg:w-[250px]"
          />
        )}
        {(facetedColumns ?? []).map((facet) => {
          return (
            <DataTableFacetedFilter
              key={facet.column.id}
              column={facet.column}
              title={facet.title}
              options={facet.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("reset")}
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
      <DataTableExport table={table} />
    </div>
  );
}
