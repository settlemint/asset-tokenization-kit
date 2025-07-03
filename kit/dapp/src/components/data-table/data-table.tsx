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
import * as React from "react";
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
import { withDataTableErrorBoundary } from "./data-table-error-boundary";

/**
 * Props for the DataTable component.
 * @template TData The type of data in the table rows
 * @template CParams The type of column parameters passed to column definitions
 */
export interface DataTableProps<
  TData,
  CParams extends Record<string, unknown>,
> {
  /** Optional parameters to pass to the column definitions function */
  columnParams?: CParams;
  /** The column definitions for the table. Can be a function that receives params or a no-arg function */
  columns:
    | ((
        params: CParams
      ) => Parameters<typeof useReactTable<TData>>[0]["columns"])
    | (() => Parameters<typeof useReactTable<TData>>[0]["columns"]);
  /** The data to be displayed in the table */
  data: TData[];
  /** Whether the table is in a loading state */
  isLoading?: boolean;
  /** Custom icons to use in the table (passed to table meta) */
  icons?: Record<string, ComponentType<{ className?: string }>>;
  /** Unique name identifier for the table (used for state persistence) */
  name: string;
  /** Configuration for the table toolbar */
  toolbar?: DataTableToolbarOptions & { useAdvanced?: boolean };
  /** Configuration for the advanced toolbar (if useAdvanced is true) */
  advancedToolbar?: DataTableAdvancedToolbarOptions;
  /** Pagination configuration options */
  pagination?: DataTablePaginationOptions;
  /** Initial sorting state for the table */
  initialSorting?: SortingState;
  /** Initial column filter state */
  initialColumnFilters?: ColumnFiltersState;
  /** Initial page size. Defaults to 10 */
  initialPageSize?: number;
  /** Additional CSS classes for the table container */
  className?: string;
  /** Custom empty state component props when data array is empty */
  customEmptyState?: DataTableEmptyStateProps;
  /** Bulk actions configuration for row selection and batch operations */
  bulkActions?: {
    /** Whether to enable bulk actions */
    enabled?: boolean;
    /** Array of individual bulk action definitions */
    actions?: BulkAction<TData>[];
    /** Array of grouped bulk actions */
    actionGroups?: BulkActionGroup<TData>[];
    /** Position of the action bar relative to the table */
    position?: "bottom" | "top";
    /** Whether to show the count of selected rows */
    showSelectionCount?: boolean;
    /** Whether to enable the "select all" functionality */
    enableSelectAll?: boolean;
    /** Additional CSS classes for the action bar */
    actionBarClassName?: string;
  };
  /** URL state persistence configuration for maintaining table state in URL parameters */
  urlState?: UseDataTableStateOptions & {
    /** Whether to enable URL state persistence */
    enabled?: boolean;
  };
  /** Callback fired when a table row is clicked (excluding interactive elements) */
  onRowClick?: (row: TData) => void;
}

/**
 * Module augmentation for TanStack Table to add custom metadata.
 * Extends the TableMeta interface with our custom properties.
 */
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    /** Unique identifier for the table instance */
    name: string;
    /** Custom icon components that can be used within the table */
    icons?: Record<string, ComponentType<{ className?: string }>>;
  }
}

/**
 * A reusable data table component with sorting, filtering, pagination, and bulk actions.
 * Supports both local and URL-based state management for table configuration.
 *
 * @template TData The type of data in the table rows
 * @template CParams The type of column parameters passed to column definitions
 * @param props The component props
 * @returns The rendered DataTable component with full functionality
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DataTable
 *   name="users-table"
 *   columns={userColumns}
 *   data={users}
 * />
 *
 * // With bulk actions and URL state
 * <DataTable
 *   name="products-table"
 *   columns={(params) => productColumns(params)}
 *   columnParams={{ showPrices: true }}
 *   data={products}
 *   bulkActions={{
 *     enabled: true,
 *     actions: [deleteAction, exportAction]
 *   }}
 *   urlState={{ enabled: true }}
 *   onRowClick={(product) => navigate(`/products/${product.id}`)}
 * />
 * ```
 */
function DataTableComponent<TData, CParams extends Record<string, unknown>>({
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
  onRowClick,
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
  const selectedRowIds = Object.keys(currentState.rowSelection).filter(
    (key) =>
      currentState.rowSelection[
        key as keyof typeof currentState.rowSelection
      ] === true
  );
  const selectedRows = useMemo(() => {
    if (!isBulkActionsEnabled || selectedRowIds.length === 0) return [];
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [isBulkActionsEnabled, selectedRowIds, table]);

  /**
   * Clears all row selections in the table.
   * Uses URL state or local state based on configuration.
   */
  const handleSelectionClear = useCallback(() => {
    if (isUsingUrlState) {
      tableState.setRowSelection({});
    } else {
      setLocalRowSelection({});
    }
  }, [isUsingUrlState, tableState]);

  /**
   * Handles row click events, preventing propagation from interactive elements.
   * @param row The table row data
   * @returns Event handler function
   */
  const createRowClickHandler = useCallback(
    (row: TData) => (e: React.MouseEvent<HTMLTableRowElement>) => {
      // Don't trigger row click if clicking on interactive elements
      const target = e.target as HTMLElement;
      const isInteractiveElement = !!(
        target.closest("button") ??
        target.closest("a") ??
        target.closest("input") ??
        target.closest("select") ??
        target.closest('[role="button"]') ??
        target.closest('[role="checkbox"]') ??
        target.closest('[role="menuitem"]') ??
        target.closest("[data-radix-collection-item]")
      );

      if (!isInteractiveElement && onRowClick) {
        onRowClick(row);
      }
    },
    [onRowClick]
  );

  /**
   * Renders the table body with rows or empty state message.
   * Handles row click events and filters out clicks on interactive elements.
   * @returns The rendered table body content
   */
  const renderTableBody = () => {
    if (table.getRowModel().rows.length) {
      return table.getRowModel().rows.map((row) => {
        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            onClick={createRowClickHandler(row.original)}
            className={cn(
              onRowClick && "cursor-pointer hover:bg-muted/50 transition-colors"
            )}
          >
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
        );
      });
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

/**
 * DataTable component wrapped with error boundary for production safety.
 * This is the default export that should be used in most cases.
 *
 * @template TData The type of data in the table rows
 * @template CParams The type of column parameters passed to column definitions
 */
export const DataTable = withDataTableErrorBoundary(DataTableComponent, {
  tableName: "DataTable",
}) as <TData, CParams extends Record<string, unknown>>(
  props: DataTableProps<TData, CParams>
) => React.JSX.Element;

/**
 * Raw DataTable component without error boundary.
 * Use this only if you need to implement custom error handling.
 *
 * @template TData The type of data in the table rows
 * @template CParams The type of column parameters passed to column definitions
 */
export const DataTableRaw = DataTableComponent;
