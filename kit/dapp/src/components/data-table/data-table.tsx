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
import { useTranslation } from "react-i18next";
import { type ComponentType, useCallback, useMemo, useState } from "react";
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
  DataTableAdvancedToolbar,
  type DataTableAdvancedToolbarOptions,
} from "./data-table-advanced-toolbar";
import {
  DataTableToolbar,
  type DataTableToolbarOptions,
} from "./data-table-toolbar";
import { DataTableActionBar } from "./data-table-action-bar";
import type { BulkAction, BulkActionGroup } from "./types/bulk-actions";
import {
  useDataTableState,
  type UseDataTableStateOptions,
} from "@/hooks/use-data-table-state";

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
  toolbar?: DataTableToolbarOptions & { useAdvanced?: boolean };
  advancedToolbar?: DataTableAdvancedToolbarOptions;
  pagination?: DataTablePaginationOptions;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialPageSize?: number;
  className?: string;
  customEmptyState?: DataTableEmptyStateProps;
  /** Bulk actions configuration */
  bulkActions?: {
    enabled?: boolean;
    actions?: BulkAction<TData>[];
    actionGroups?: BulkActionGroup<TData>[];
    position?: "bottom" | "top";
    showSelectionCount?: boolean;
    enableSelectAll?: boolean;
    actionBarClassName?: string;
  };
  /** URL state persistence configuration */
  urlState?: UseDataTableStateOptions & {
    /** Whether to enable URL state persistence */
    enabled?: boolean;
  };
}

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    name: string;
    icons?: Record<string, ComponentType<{ className?: string }>>;
  }
}

// Import extended table meta types
import "./types/table-meta";

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
  advancedToolbar,
  pagination,
  initialSorting,
  initialColumnFilters,
  initialPageSize,
  className,
  customEmptyState,
  bulkActions,
  urlState,
}: DataTableProps<TData, CParams>) {
  const { t } = useTranslation("general");

  // Use URL state management if enabled, otherwise use local state
  const tableState = useDataTableState({
    enableUrlPersistence: urlState?.enabled ?? false,
    defaultPageSize: initialPageSize ?? urlState?.defaultPageSize ?? 10,
    initialSorting: initialSorting ?? urlState?.initialSorting ?? [],
    initialColumnFilters:
      initialColumnFilters ?? urlState?.initialColumnFilters ?? [],
    initialColumnVisibility: urlState?.initialColumnVisibility ?? {},
    debounceMs: urlState?.debounceMs ?? 300,
    enableGlobalFilter: urlState?.enableGlobalFilter ?? true,
    enableRowSelection: urlState?.enableRowSelection ?? true,
    routePath: urlState?.routePath,
  });

  // Fallback to local state for compatibility when URL state is disabled
  const [localRowSelection, setLocalRowSelection] = useState({});
  const [localSorting, setLocalSorting] = useState<SortingState>(
    initialSorting ?? []
  );
  const [localColumnFilters, setLocalColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters ?? []);
  const [localColumnVisibility, setLocalColumnVisibility] =
    useState<VisibilityState>({});
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  // Choose between URL state or local state
  const isUsingUrlState = urlState?.enabled ?? false;
  const currentState = isUsingUrlState
    ? tableState.tableOptions.state
    : {
        rowSelection: localRowSelection,
        sorting: localSorting,
        columnFilters: localColumnFilters,
        columnVisibility: localColumnVisibility,
        globalFilter: localGlobalFilter,
        pagination: { pageIndex: 0, pageSize: initialPageSize ?? 10 },
      };

  const stateHandlers = isUsingUrlState
    ? {
        onRowSelectionChange: tableState.setRowSelection,
        onSortingChange: tableState.setSorting,
        onColumnFiltersChange: tableState.setColumnFilters,
        onColumnVisibilityChange: tableState.setColumnVisibility,
        onGlobalFilterChange: tableState.setGlobalFilter,
        onPaginationChange: tableState.setPagination,
      }
    : {
        onRowSelectionChange: setLocalRowSelection,
        onSortingChange: setLocalSorting,
        onColumnFiltersChange: setLocalColumnFilters,
        onColumnVisibilityChange: setLocalColumnVisibility,
        onGlobalFilterChange: setLocalGlobalFilter,
        onPaginationChange: () => {
          // Local pagination is handled differently
        },
      };

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
        pageSize: initialPageSize ?? 10,
      },
    },

    state: currentState,

    ...stateHandlers,

    meta: {
      name,
      icons,
    },
  });

  // Bulk actions state and handlers (after table creation)
  const isBulkActionsEnabled = bulkActions?.enabled ?? false;
  const selectedRowIds = Object.keys(currentState.rowSelection ?? {}).filter(
    (key) => currentState.rowSelection?.[key as keyof typeof currentState.rowSelection] === true
  );
  const selectedRows = useMemo(() => {
    if (!isBulkActionsEnabled || selectedRowIds.length === 0) return [];
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [isBulkActionsEnabled, selectedRowIds, table]);

  const handleSelectionClear = useCallback(() => {
    if (isUsingUrlState) {
      tableState.setRowSelection({});
    } else {
      setLocalRowSelection({});
    }
  }, [isUsingUrlState, tableState]);

  const renderTableBody = () => {
    if (table.getRowModel().rows.length) {
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
          {t("components.data-table.no-results")}
        </TableCell>
      </TableRow>
    );
  };

  if (data.length === 0 && customEmptyState) {
    return <DataTableEmptyState {...customEmptyState} />;
  }

  const shouldUseAdvancedToolbar = toolbar?.useAdvanced ?? advancedToolbar;

  return (
    <div className="space-y-4">
      {shouldUseAdvancedToolbar ? (
        <DataTableAdvancedToolbar
          table={table}
          {...(advancedToolbar ?? {})}
          {...(toolbar?.useAdvanced ? toolbar : {})}
        />
      ) : (
        <DataTableToolbar table={table} {...toolbar} />
      )}
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
      {table.getRowModel().rows.length > 0 && (
        <DataTablePagination table={table} {...pagination} />
      )}

      {/* Bulk Actions Bar */}
      {isBulkActionsEnabled && (
        <DataTableActionBar
          selectedRowIds={selectedRowIds}
          selectedRows={selectedRows}
          table={table}
          actions={bulkActions?.actions}
          actionGroups={bulkActions?.actionGroups}
          onSelectionClear={handleSelectionClear}
          position={bulkActions?.position}
          className={bulkActions?.actionBarClassName}
          showSelectionCount={bulkActions?.showSelectionCount}
          enableSelectAll={bulkActions?.enableSelectAll}
        />
      )}
    </div>
  );
}
