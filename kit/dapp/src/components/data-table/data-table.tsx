import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDataTableState,
  type UseDataTableStateOptions,
} from "@/hooks/use-data-table-state";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils/debounce";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowData,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { PackageOpen } from "lucide-react";
import * as React from "react";
import { type ComponentType, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTableActionBar } from "./data-table-action-bar";
import {
  DataTableAdvancedToolbar,
  type DataTableAdvancedToolbarOptions,
} from "./data-table-advanced-toolbar";
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
import type { BulkAction, BulkActionGroup } from "./types/bulk-actions";

/**
 * Props for the DataTable component.
 * @template TData The type of data in the table rows
 */
export interface DataTableProps<TData> {
  /** The column definitions for the table */
  columns: Parameters<typeof useReactTable<TData>>[0]["columns"];
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
  /** Initial column visibility state */
  initialColumnVisibility?: VisibilityState;
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
  /** Server-side pagination configuration */
  serverSidePagination?: {
    /** Total number of items across all pages */
    totalCount: number;
    /** Whether pagination is handled server-side */
    enabled: boolean;
  };
  /** External state handlers for manual state management */
  externalState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    globalFilter?: string;
    onPaginationChange?: (
      updater: PaginationState | ((old: PaginationState) => PaginationState)
    ) => void;
    onGlobalFilterChange?: (
      updater: string | ((old: string) => string)
    ) => void;
    onSortingChange?: (
      updater: SortingState | ((old: SortingState) => SortingState)
    ) => void;
  };
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
 *   columns={productColumns}
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
function DataTableComponent<TData>({
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
  initialColumnVisibility,
  className,
  customEmptyState,
  bulkActions,
  urlState,
  onRowClick,
  serverSidePagination,
  externalState,
}: DataTableProps<TData>) {
  "use no memo";
  const { t } = useTranslation("data-table");

  // Use URL state management if enabled, otherwise use local state
  const tableState = useDataTableState({
    enableUrlPersistence: urlState?.enabled ?? false,
    defaultPageSize: initialPageSize ?? urlState?.defaultPageSize ?? 10,
    initialSorting: initialSorting ?? urlState?.initialSorting ?? [],
    initialColumnFilters:
      initialColumnFilters ?? urlState?.initialColumnFilters ?? [],
    initialColumnVisibility:
      urlState?.initialColumnVisibility ?? initialColumnVisibility ?? {},
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
    useState<VisibilityState>(initialColumnVisibility ?? {});
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  // Validate URL state configuration
  const logger = useMemo(() => createLogger(), []);

  // Choose between URL state or local state
  const isUsingUrlState = urlState?.enabled ?? false;

  // Log warning if URL state is enabled but routePath is missing
  if (isUsingUrlState && !urlState?.routePath) {
    logger.warn("DataTable: URL state enabled but no routePath provided", {
      name,
      urlStateConfig: urlState,
    });
  }
  const currentState =
    isUsingUrlState && urlState?.routePath
      ? tableState.tableOptions.state
      : externalState
        ? {
            rowSelection: localRowSelection,
            sorting: externalState.sorting ?? localSorting,
            columnFilters: localColumnFilters,
            columnVisibility: localColumnVisibility,
            globalFilter: externalState.globalFilter ?? localGlobalFilter,
            pagination: externalState.pagination ?? {
              pageIndex: 0,
              pageSize: initialPageSize ?? 10,
            },
          }
        : {
            rowSelection: localRowSelection,
            sorting: localSorting,
            columnFilters: localColumnFilters,
            columnVisibility: localColumnVisibility,
            globalFilter: localGlobalFilter,
            pagination: { pageIndex: 0, pageSize: initialPageSize ?? 10 },
          };

  const debouncedExternalGlobalFilterChange = React.useMemo(() => {
    if (!externalState?.onGlobalFilterChange) {
      return null;
    }

    const state = externalState;

    const handler = (updater: string | ((old: string) => string)) => {
      let nextValue = "";
      setLocalGlobalFilter((previous) => {
        const base = state.globalFilter ?? previous;
        nextValue = typeof updater === "function" ? updater(base) : updater;
        return nextValue;
      });
      state.onGlobalFilterChange!(nextValue);
    };

    return debounce(handler, urlState?.debounceMs ?? 300);
  }, [externalState, urlState?.debounceMs]);

  React.useEffect(() => {
    return () => {
      debouncedExternalGlobalFilterChange?.cancel();
    };
  }, [debouncedExternalGlobalFilterChange]);

  const stateHandlers =
    isUsingUrlState && urlState?.routePath
      ? {
          onRowSelectionChange: tableState.setRowSelection,
          onSortingChange: tableState.setSorting,
          onColumnFiltersChange: tableState.setColumnFilters,
          onColumnVisibilityChange: tableState.setColumnVisibility,
          onGlobalFilterChange: tableState.setGlobalFilter,
          onPaginationChange: tableState.setPagination,
        }
      : externalState
        ? {
            onRowSelectionChange: setLocalRowSelection,
            onSortingChange: externalState.onSortingChange ?? setLocalSorting,
            onColumnFiltersChange: setLocalColumnFilters,
            onColumnVisibilityChange: setLocalColumnVisibility,
            onGlobalFilterChange:
              debouncedExternalGlobalFilterChange ?? setLocalGlobalFilter,
            onPaginationChange: externalState.onPaginationChange ?? (() => {}),
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

  const table = useReactTable({
    data,
    columns,
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

    // Server-side pagination configuration
    manualPagination: serverSidePagination?.enabled ?? false,
    manualSorting: serverSidePagination?.enabled ?? false,
    pageCount: serverSidePagination?.enabled
      ? Math.ceil(
          serverSidePagination.totalCount / currentState.pagination.pageSize
        )
      : undefined,

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
  const selectedRows =
    isBulkActionsEnabled && selectedRowIds.length > 0
      ? table.getSelectedRowModel().rows.map((row) => row.original)
      : [];

  /**
   * Clears all row selections in the table.
   * Uses URL state or local state based on configuration.
   */
  const handleSelectionClear = () => {
    if (isUsingUrlState) {
      tableState.setRowSelection({});
    } else {
      setLocalRowSelection({});
    }
  };

  /**
   * Handles row click events, preventing propagation from interactive elements.
   * @param row The table row data
   * @returns Event handler function
   */
  const createRowClickHandler =
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
    };

  /**
   * Handles clearing all filters in the table.
   * Resets both global filter and column filters.
   */
  const handleClearFilters = () => {
    table.resetGlobalFilter();
    table.resetColumnFilters();
  };

  /**
   * Renders the table body with rows or empty state message.
   * Handles row click events and filters out clicks on interactive elements.
   * @returns The rendered table body content
   */
  const renderTableBody = () => {
    if (table.getRowModel().rows.length > 0) {
      return table.getRowModel().rows.map((row) => {
        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            onClick={createRowClickHandler(row.original)}
            className={cn(
              "transition-transform transition-shadow duration-200 ease-out",
              onRowClick && [
                "cursor-pointer",
                "hover:bg-muted/50",
                "hover:shadow-sm",
                "hover:scale-[1.001]",
                "active:scale-[0.999]",
              ],
              row.getIsSelected() && "bg-muted/30"
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
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={columns.length}
          className="h-64 text-center align-middle"
        >
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <PackageOpen className="h-12 w-12" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("noResults")}</p>
              <p className="text-xs text-muted-foreground/70">
                {currentState.globalFilter ||
                currentState.columnFilters.length > 0
                  ? t("tryAdjustingFilters")
                  : t("noDataAvailable")}
              </p>
            </div>
            {(currentState.globalFilter ||
              currentState.columnFilters.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

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
      {data.length === 0 && customEmptyState ? (
        <DataTableEmptyState {...customEmptyState} />
      ) : (
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
      )}
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
 * DataTable component for displaying tabular data.
 *
 * @template TData The type of data in the table rows
 *
 * @example
 * ```tsx
 * // For route-level error handling, use TanStack Start's errorComponent
 * export const Route = createFileRoute('/my-route')({
 *   errorComponent: DefaultCatchBoundary,
 *   component: MyComponent
 * })
 *
 * // For component-level error isolation, wrap with DataTableErrorBoundary
 * <DataTableErrorBoundary tableName="Users">
 *   <DataTable columns={columns} data={data} name="users" />
 * </DataTableErrorBoundary>
 * ```
 */
export const DataTable = DataTableComponent;
