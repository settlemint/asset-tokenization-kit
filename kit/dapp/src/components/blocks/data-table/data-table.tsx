"use client";
"use no memo"; // fixes rerendering with react compiler, v9 of tanstack table will fix this

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { type ComponentType, useMemo, useState } from "react";
import { DataTableColumnCell } from "./data-table-column-cell";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  DataTableEmptyState,
  type DataTableEmptyStateProps,
} from "./data-table-empty-state";
import {
  DataTablePagination,
  type DataTablePaginationOptions,
} from "./data-table-pagination";
import {
  DataTableToolbar,
  type DataTableToolbarOptions,
} from "./data-table-toolbar";

interface DataTableProps<TData, CParams extends Record<string, unknown>> {
  columnParams?: CParams;
  /** The column definitions for the table. */
  columns:
    | ((
        params: CParams
      ) => Parameters<typeof useReactTable<TData>>[0]["columns"])
    | (() => Parameters<typeof useReactTable<TData>>[0]["columns"]);
  /** The data to be displayed in the table. */
  data: TData[];
  isLoading?: boolean;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialPageSize?: number;
  className?: string;
  customEmptyState?: DataTableEmptyStateProps;
}

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    name: string;
    icons?: Record<string, ComponentType<{ className?: string }>>;
  }
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterComponentOptions?: {
      title: string;
      options: { label: string; value: string }[];
    };
    enableCsvExport?: boolean;
    variant?: "default" | "numeric";
    detailUrl?: string;
  }
}

/**
/**
 * A reusable data table component with sorting, filtering, and pagination.
 * @template TData The type of data in the table.
 * @template TValue The type of values in the table cells.
 * @param props The component props.
 * @returns The rendered DataTable component.
 */
export function DataTable<TData, CParams extends Record<string, unknown>>({
  columnParams,
  columns,
  data,
  icons,
  name,
  toolbar,
  pagination,
  initialSorting,
  initialColumnFilters,
  initialPageSize,
  className,
  customEmptyState,
}: DataTableProps<TData, CParams>) {
  const t = useTranslations("components.data-table");
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialColumnFilters ?? []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const memoizedData = useMemo(() => data, [data]);

  const tableColumns = columnParams
    ? columns(columnParams)
    : columns({} as CParams);
  const table = useReactTable({
    data: memoizedData,
    columns: tableColumns,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",

    initialState: {
      pagination: {
        pageSize: initialPageSize ?? 5,
      },
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },

    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,

    meta: {
      name,
      icons,
    },
  });

  const renderTableBody = () => {
    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map((cell) => {
            const content = flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            );

            return (
              <TableCell key={cell.id}>
                <DataTableColumnCell
                  variant={cell.column.columnDef.meta?.variant}
                >
                  {content}
                </DataTableColumnCell>
              </TableCell>
            );
          })}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={tableColumns.length} className="h-24 text-center">
          {t("no-results")}
        </TableCell>
      </TableRow>
    );
  };

  if (data.length === 0 && customEmptyState) {
    return <DataTableEmptyState {...customEmptyState} />;
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} {...toolbar} />
      <div
        data-slot="data-table"
        className={cn(
          "w-full overflow-x-auto rounded-xl bg-card text-sidebar-foreground shadow-sm",
          className
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : typeof header.column
                          .columnDef.header === "string" ? (
                        <DataTableColumnHeader
                          column={header.column}
                          variant={header.column.columnDef.meta?.variant}
                        >
                          {header.column.columnDef.header}
                        </DataTableColumnHeader>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>
      {table.getRowModel().rows?.length > 0 && (
        <DataTablePagination table={table} {...pagination} />
      )}
    </div>
  );
}
