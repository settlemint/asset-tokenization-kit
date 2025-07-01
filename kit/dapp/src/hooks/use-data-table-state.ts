/**
 * DataTable State Management Hook
 *
 * This hook provides URL-based state management for DataTable components using
 * TanStack Router's search parameters. It enables persistent, shareable table
 * state including filters, sorting, pagination, column visibility, and row selection.
 *
 * Key features:
 * - URL-based state persistence
 * - Type-safe search parameter validation
 * - Debounced URL updates to prevent excessive navigation
 * - Seamless integration with TanStack Table
 * - Shareable URLs with complete table state
 * - Browser back/forward navigation support
 *
 * @example
 * ```tsx
 * // In a route component
 * const tableState = useDataTableState({
 *   enableUrlPersistence: true,
 *   defaultPageSize: 20
 * });
 *
 * const table = useReactTable({
 *   data,
 *   columns,
 *   ...tableState.tableOptions,
 * });
 * ```
 * @see {@link https://tanstack.com/router/latest/docs/framework/react/guide/search-params} - TanStack Router search params
 * @see {@link https://tanstack.com/table/latest} - TanStack Table
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import type { DataTableSearchParams } from "@/components/data-table/utils/search-params";
import {
  createDebouncedUrlUpdate,
  deserializeDataTableState,
  searchParamsToTableState,
  serializeDataTableState,
  tableStateToSearchParams,
} from "@/components/data-table/utils/search-param-serializers";

/**
 * Configuration options for the DataTable state hook
 */
export interface UseDataTableStateOptions {
  /** Whether to persist state in URL search parameters */
  enableUrlPersistence?: boolean;
  /** Default page size for pagination */
  defaultPageSize?: number;
  /** Initial sorting state */
  initialSorting?: SortingState;
  /** Initial column filters */
  initialColumnFilters?: ColumnFiltersState;
  /** Initial column visibility */
  initialColumnVisibility?: VisibilityState;
  /** Debounce delay for URL updates (ms) */
  debounceMs?: number;
  /** Whether to enable global filter/search */
  enableGlobalFilter?: boolean;
  /** Whether to enable row selection */
  enableRowSelection?: boolean;
  /** Route path for type-safe search parameter access */
  routePath?: string;
}

/**
 * Return type for the useDataTableState hook
 */
export interface DataTableStateReturn {
  /** Current pagination state */
  pagination: PaginationState;
  /** Current sorting state */
  sorting: SortingState;
  /** Current column filters state */
  columnFilters: ColumnFiltersState;
  /** Current global filter value */
  globalFilter: string;
  /** Current column visibility state */
  columnVisibility: VisibilityState;
  /** Current row selection state */
  rowSelection: RowSelectionState;
  /** State setters for manual control */
  setPagination: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void;
  setColumnFilters: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => void;
  setGlobalFilter: (updater: string | ((old: string) => string)) => void;
  setColumnVisibility: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => void;
  setRowSelection: (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => void;
  /** Reset all state to defaults */
  resetState: () => void;
  /** TanStack Table configuration object */
  tableOptions: {
    state: {
      pagination: PaginationState;
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      globalFilter: string;
      columnVisibility: VisibilityState;
      rowSelection: RowSelectionState;
    };
    onPaginationChange: (
      updater: PaginationState | ((old: PaginationState) => PaginationState)
    ) => void;
    onSortingChange: (
      updater: SortingState | ((old: SortingState) => SortingState)
    ) => void;
    onColumnFiltersChange: (
      updater:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState)
    ) => void;
    onGlobalFilterChange: (updater: string | ((old: string) => string)) => void;
    onColumnVisibilityChange: (
      updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
    ) => void;
    onRowSelectionChange: (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => void;
  };
}

/**
 * Hook for managing DataTable state with optional URL persistence
 *
 * This hook can work in two modes:
 * 1. URL-based persistence: State is synced with URL search parameters
 * 2. Local state only: State is managed locally without URL persistence
 */
export function useDataTableState(
  options: UseDataTableStateOptions = {}
): DataTableStateReturn {
  const {
    enableUrlPersistence = false,
    defaultPageSize = 10,
    initialSorting = [],
    initialColumnFilters = [],
    initialColumnVisibility = {},
    debounceMs = 300,
    routePath,
  } = options;

  const navigate = useNavigate();

  // Get search params from URL - always call hook, but conditionally use the result
  const rawUrlSearchParams = useSearch({
    strict: false,
    from: routePath as undefined,
  });
  const urlSearchParams = useMemo(() => {
    return enableUrlPersistence ? rawUrlSearchParams : {};
  }, [enableUrlPersistence, rawUrlSearchParams]);

  // Initialize state from URL or defaults
  const initialState = useMemo(() => {
    if (enableUrlPersistence && Object.keys(urlSearchParams).length > 0) {
      const deserializedState = deserializeDataTableState(urlSearchParams);
      return {
        pagination: deserializedState.pagination ?? {
          pageIndex: 0,
          pageSize: defaultPageSize,
        },
        sorting:
          deserializedState.sorting.length > 0
            ? deserializedState.sorting
            : initialSorting,
        columnFilters:
          deserializedState.columnFilters.length > 0
            ? deserializedState.columnFilters
            : initialColumnFilters,
        globalFilter: deserializedState.globalFilter || "",
        columnVisibility:
          Object.keys(deserializedState.columnVisibility).length > 0
            ? deserializedState.columnVisibility
            : initialColumnVisibility,
        rowSelection: deserializedState.rowSelection,
      };
    }

    return {
      pagination: { pageIndex: 0, pageSize: defaultPageSize },
      sorting: initialSorting,
      columnFilters: initialColumnFilters,
      globalFilter: "",
      columnVisibility: initialColumnVisibility,
      rowSelection: {},
    };
  }, [
    enableUrlPersistence,
    urlSearchParams,
    defaultPageSize,
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
  ]);

  // Local state
  const [pagination, setPaginationState] = useState<PaginationState>(
    initialState.pagination
  );
  const [sorting, setSortingState] = useState<SortingState>(
    initialState.sorting
  );
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    initialState.columnFilters
  );
  const [globalFilter, setGlobalFilterState] = useState<string>(
    initialState.globalFilter
  );
  const [columnVisibility, setColumnVisibilityState] =
    useState<VisibilityState>(initialState.columnVisibility);
  const [rowSelection, setRowSelectionState] = useState<RowSelectionState>(
    initialState.rowSelection
  );

  // Ref to track if we're updating from URL to prevent update loops
  const isUpdatingFromUrlRef = useRef(false);

  // Debounced URL update function
  const debouncedUrlUpdate = useMemo(
    () =>
      createDebouncedUrlUpdate((newSearchParams: Record<string, unknown>) => {
        if (enableUrlPersistence && !isUpdatingFromUrlRef.current) {
          void navigate({
            search: newSearchParams as never,
            replace: true,
          });
        }
      }, debounceMs),
    [navigate, enableUrlPersistence, debounceMs]
  );

  // Update URL when state changes
  const updateUrl = useCallback(
    (newState: Partial<DataTableSearchParams>) => {
      if (enableUrlPersistence) {
        const serializedState = serializeDataTableState(newState);
        debouncedUrlUpdate(serializedState);
      }
    },
    [enableUrlPersistence, debouncedUrlUpdate]
  );

  // State setters that also update URL
  const setPagination = useCallback(
    (
      updater: PaginationState | ((old: PaginationState) => PaginationState)
    ) => {
      setPaginationState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ pagination: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  const setSorting = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSortingState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ sorting: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  const setColumnFilters = useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState)
    ) => {
      setColumnFiltersState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ columnFilters: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  const setGlobalFilter = useCallback(
    (updater: string | ((old: string) => string)) => {
      setGlobalFilterState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ globalFilter: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  const setColumnVisibility = useCallback(
    (
      updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
    ) => {
      setColumnVisibilityState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ columnVisibility: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  const setRowSelection = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      setRowSelectionState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl(tableStateToSearchParams({ rowSelection: newState }));
        return newState;
      });
    },
    [updateUrl]
  );

  // Reset all state to defaults
  const resetState = useCallback(() => {
    const defaultState = {
      pagination: { pageIndex: 0, pageSize: defaultPageSize },
      sorting: initialSorting,
      columnFilters: initialColumnFilters,
      globalFilter: "",
      columnVisibility: initialColumnVisibility,
      rowSelection: {},
    };

    setPaginationState(defaultState.pagination);
    setSortingState(defaultState.sorting);
    setColumnFiltersState(defaultState.columnFilters);
    setGlobalFilterState(defaultState.globalFilter);
    setColumnVisibilityState(defaultState.columnVisibility);
    setRowSelectionState(defaultState.rowSelection);

    if (enableUrlPersistence) {
      void navigate({
        search: {} as never,
        replace: true,
      });
    }
  }, [
    defaultPageSize,
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
    enableUrlPersistence,
    navigate,
  ]);

  // Sync state when URL changes (for back/forward navigation)
  useEffect(() => {
    if (enableUrlPersistence && Object.keys(urlSearchParams).length > 0) {
      isUpdatingFromUrlRef.current = true;

      const deserializedState = deserializeDataTableState(urlSearchParams);
      const tableState = searchParamsToTableState(deserializedState);

      setPaginationState(
        tableState.pagination ?? { pageIndex: 0, pageSize: defaultPageSize }
      );
      setSortingState(tableState.sorting);
      setColumnFiltersState(tableState.columnFilters);
      setGlobalFilterState(tableState.globalFilter);
      setColumnVisibilityState(tableState.columnVisibility);
      setRowSelectionState(tableState.rowSelection);

      // Reset the flag after a brief delay
      setTimeout(() => {
        isUpdatingFromUrlRef.current = false;
      }, 50);
    }
  }, [enableUrlPersistence, urlSearchParams, defaultPageSize]);

  // TanStack Table configuration object
  const tableOptions = useMemo(
    () => ({
      state: {
        pagination,
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        rowSelection,
      },
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
    }),
    [
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      setPagination,
      setSorting,
      setColumnFilters,
      setGlobalFilter,
      setColumnVisibility,
      setRowSelection,
    ]
  );

  return {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    rowSelection,
    setPagination,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
    setColumnVisibility,
    setRowSelection,
    resetState,
    tableOptions,
  };
}
