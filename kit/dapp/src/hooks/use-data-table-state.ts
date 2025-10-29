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

import { useNavigate, useSearch } from "@tanstack/react-router";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  deserializeDataTableState,
  searchParamsToTableState,
  serializeDataTableState,
} from "@/components/data-table/utils/search-param-serializers";
import { debounce } from "@/lib/utils/debounce";

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
    state: Partial<TableState>;
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

  const navigate = useNavigate({ from: routePath as never });

  // Get search params from URL - always call hook, but conditionally use the result
  const rawUrlSearchParams = useSearch({
    strict: false,
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

  // Version counter to track URL updates and prevent race conditions
  const updateVersionRef = useRef(0);
  const currentVersionRef = useRef(0);

  // Debounced URL update function with proper cleanup
  const debouncedUrlUpdate = useMemo(
    () =>
      debounce((newSearchParams: Record<string, unknown>) => {
        if (enableUrlPersistence) {
          // Increment version for this update
          const updateVersion = ++updateVersionRef.current;

          void navigate({
            search: newSearchParams as never,
            replace: true,
          }).then(() => {
            // Update current version after navigation completes
            currentVersionRef.current = updateVersion;
          });
        }
      }, debounceMs),
    [navigate, enableUrlPersistence, debounceMs]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUrlUpdate.cancel();
    };
  }, [debouncedUrlUpdate]);

  // Update URL when state changes
  const updateUrl = useCallback(
    (newTableState: {
      pagination?: PaginationState;
      sorting?: SortingState;
      columnFilters?: ColumnFiltersState;
      globalFilter?: string;
      columnVisibility?: VisibilityState;
      rowSelection?: RowSelectionState;
    }) => {
      if (enableUrlPersistence) {
        // Use the new state directly without merging
        const serializedState = serializeDataTableState(
          newTableState,
          defaultPageSize
        );
        debouncedUrlUpdate(serializedState);
      }
    },
    [enableUrlPersistence, debouncedUrlUpdate, defaultPageSize]
  );

  // State setters that also update URL
  const setPagination = useCallback(
    (
      updater: PaginationState | ((old: PaginationState) => PaginationState)
    ) => {
      setPaginationState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination: newState,
          sorting,
          columnFilters,
          globalFilter,
          columnVisibility,
          rowSelection,
        });
        return newState;
      });
    },
    [
      updateUrl,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    ]
  );

  const setSorting = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSortingState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination,
          sorting: newState,
          columnFilters,
          globalFilter,
          columnVisibility,
          rowSelection,
        });
        return newState;
      });
    },
    [
      updateUrl,
      pagination,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    ]
  );

  const setColumnFilters = useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState)
    ) => {
      setColumnFiltersState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination,
          sorting,
          columnFilters: newState,
          globalFilter,
          columnVisibility,
          rowSelection,
        });
        return newState;
      });
    },
    [
      updateUrl,
      pagination,
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    ]
  );

  const setGlobalFilter = useCallback(
    (updater: string | ((old: string) => string)) => {
      setGlobalFilterState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination,
          sorting,
          columnFilters,
          globalFilter: newState,
          columnVisibility,
          rowSelection,
        });
        return newState;
      });
    },
    [
      updateUrl,
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    ]
  );

  const setColumnVisibility = useCallback(
    (
      updater: VisibilityState | ((old: VisibilityState) => VisibilityState)
    ) => {
      setColumnVisibilityState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination,
          sorting,
          columnFilters,
          globalFilter,
          columnVisibility: newState,
          rowSelection,
        });
        return newState;
      });
    },
    [updateUrl, pagination, sorting, columnFilters, globalFilter, rowSelection]
  );

  const setRowSelection = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      setRowSelectionState((old) => {
        const newState = typeof updater === "function" ? updater(old) : updater;
        updateUrl({
          pagination,
          sorting,
          columnFilters,
          globalFilter,
          columnVisibility,
          rowSelection: newState,
        });
        return newState;
      });
    },
    [
      updateUrl,
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    ]
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
    if (enableUrlPersistence) {
      // Check if this is an external navigation (browser back/forward)
      // by comparing versions - if current version is behind update version,
      // it means we have pending updates that shouldn't be overwritten
      const isExternalNavigation =
        currentVersionRef.current === updateVersionRef.current;

      if (isExternalNavigation && Object.keys(urlSearchParams).length > 0) {
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
      }
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
