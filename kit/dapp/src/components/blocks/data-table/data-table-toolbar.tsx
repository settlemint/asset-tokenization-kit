"use client";
"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import { DataTableFilter } from "@/components/data-table-filter";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { DataTableExport } from "./data-table-export";
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

  return (
    <div className="flex items-center justify-between">
      <DataTableFilter table={table} />
      <DataTableViewOptions table={table} />
      <DataTableExport table={table} />
    </div>
  );
}
