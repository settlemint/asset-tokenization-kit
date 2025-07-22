import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";
import { FilterXIcon } from "lucide-react";
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
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="group h-8 w-8 p-0 border-none hover:bg-primary transition-transform transition-opacity duration-200 animate-in fade-in-0 zoom-in-95"
          >
            <FilterXIcon className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors duration-200 group-hover:rotate-90" />
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
