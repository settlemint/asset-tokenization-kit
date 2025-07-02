/**
 * Search Parameter Serialization Utilities
 *
 * This module provides utilities for serializing and deserializing complex
 * table state objects for URL search parameters. It handles type conversions,
 * encoding/decoding of complex objects, and provides fallback values for
 * invalid or missing parameters.
 *
 * Key features:
 * - Safe JSON serialization for complex objects
 * - Type coercion for URL-safe values
 * - Graceful error handling with fallbacks
 * - Optimized parameter encoding (omit defaults)
 * @see {@link https://tanstack.com/router/latest/docs/framework/react/guide/search-params} - TanStack Router search params
 */

import type {
  ColumnFilter,
  DataTableSearchParams,
  SortState,
} from "./search-params";

/**
 * Safely encode an object to JSON string for URL parameter
 * Returns undefined if the object is empty or serialization fails
 */
export function encodeObjectParam(
  obj: Record<string, unknown>
): string | undefined {
  try {
    // Don't encode empty objects
    if (Object.keys(obj).length === 0) {
      return undefined;
    }
    return JSON.stringify(obj);
  } catch {
    return undefined;
  }
}

/**
 * Safely decode a JSON string from URL parameter to object
 * Returns fallback value if parsing fails
 */
export function decodeObjectParam<T>(
  param: string | undefined,
  fallback: T
): T {
  if (!param) return fallback;

  try {
    const parsed = JSON.parse(param);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serialize DataTable state for URL search parameters
 * Omits default values to keep URLs clean
 */
export function serializeDataTableState(
  state: Partial<{
    pagination?: { pageIndex: number; pageSize: number };
    sorting?: { id: string; desc: boolean }[];
    columnFilters?: { id: string; value: unknown }[];
    globalFilter?: string;
    columnVisibility?: Record<string, boolean>;
    rowSelection?: Record<string, boolean>;
  }>,
  defaultPageSize = 10
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Pagination - only include if different from defaults
  if (state.pagination) {
    const { pageIndex, pageSize } = state.pagination;
    if (pageIndex > 0) {
      result.page = pageIndex + 1; // Convert to 1-based for user-friendly URLs
    }
    if (pageSize !== defaultPageSize) {
      result.pageSize = pageSize;
    }
  }

  // Sorting - use flat parameters
  if (state.sorting && state.sorting.length > 0) {
    // Support only single column sorting for flat params
    const firstSort = state.sorting[0];
    if (firstSort) {
      result.sortBy = firstSort.id;
      if (firstSort.desc) {
        result.sortOrder = "desc";
      }
    }
  }

  // Column filters - use filter_ prefix for each filter
  if (state.columnFilters && state.columnFilters.length > 0) {
    state.columnFilters.forEach((filter) => {
      if (
        filter.value !== undefined &&
        filter.value !== null &&
        filter.value !== ""
      ) {
        // Handle complex filter structures
        if (
          typeof filter.value === "object" &&
          "values" in filter.value &&
          "operator" in filter.value
        ) {
          const complexFilter = filter.value as {
            operator: string;
            values: unknown[];
          };
          if (
            complexFilter.values.length > 0 &&
            complexFilter.values[0] !== ""
          ) {
            result[`filter_${filter.id}`] = String(complexFilter.values[0]);
          }
        } else if (
          typeof filter.value === "string" ||
          typeof filter.value === "number" ||
          typeof filter.value === "boolean"
        ) {
          // Simple value - convert to string
          result[`filter_${filter.id}`] = String(filter.value);
        }
      }
    });
  }

  // Global filter - only include if not empty
  if (state.globalFilter?.trim()) {
    result.search = state.globalFilter;
  }

  // Column visibility - only include visible columns (not hidden)
  const visibilityKeys = state.columnVisibility
    ? Object.keys(state.columnVisibility)
    : [];
  if (visibilityKeys.length > 0 && state.columnVisibility) {
    const visibleColumns = Object.entries(state.columnVisibility)
      .filter(([, visible]) => visible)
      .map(([col]) => col);
    if (visibleColumns.length > 0) {
      result.columns = visibleColumns.join(",");
    }
  }

  // Row selection - comma separated list
  if (state.rowSelection && Object.keys(state.rowSelection).length > 0) {
    const selectedIds = Object.entries(state.rowSelection)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
    if (selectedIds.length > 0) {
      result.selected = selectedIds.join(",");
    }
  }

  return result;
}

/**
 * Deserialize URL search parameters to DataTable state
 * Provides safe fallbacks for all properties
 */
export function deserializeDataTableState(
  searchParams: Record<string, unknown>
): DataTableSearchParams {
  const page = Number(searchParams.page) || 1;
  const rawPageSize = Number(searchParams.pageSize);
  const pageSize = Number.isNaN(rawPageSize)
    ? 10
    : Math.min(100, Math.max(1, rawPageSize));

  // Sorting from flat params
  const sorting: SortState[] = searchParams.sortBy
    ? [
        {
          id: searchParams.sortBy as string,
          desc: searchParams.sortOrder === "desc",
        },
      ]
    : [];

  // Filters from filter_ prefixed params
  const columnFilters: ColumnFilter[] = [];
  Object.entries(searchParams).forEach(([key, value]) => {
    if (
      key.startsWith("filter_") &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      const filterKey = key.substring(7); // Remove 'filter_' prefix
      // For now, store as simple string values
      // The actual filter function will handle the comparison
      const filterValue =
        typeof value === "string"
          ? value
          : typeof value === "number" || typeof value === "boolean"
            ? String(value)
            : JSON.stringify(value);

      columnFilters.push({
        id: filterKey,
        value: filterValue,
      });
    }
  });

  // Column visibility from comma-separated list
  const columnVisibility: Record<string, boolean> = {};
  if (searchParams.columns && typeof searchParams.columns === "string") {
    searchParams.columns.split(",").forEach((col) => {
      columnVisibility[col] = true;
    });
  }

  // Row selection from comma-separated list
  const rowSelection: Record<string, boolean> = {};
  if (searchParams.selected && typeof searchParams.selected === "string") {
    searchParams.selected.split(",").forEach((id) => {
      rowSelection[id] = true;
    });
  }

  return {
    pagination: {
      pageIndex: Math.max(0, page - 1), // Convert from 1-based to 0-based
      pageSize,
    },
    sorting,
    columnFilters,
    globalFilter: (searchParams.search as string) || "",
    columnVisibility,
    rowSelection,
  };
}

/**
 * Convert TanStack Table state to our search param format
 * Handles the conversion between different state structures
 */
export function tableStateToSearchParams(tableState: {
  pagination?: { pageIndex: number; pageSize: number };
  sorting?: { id: string; desc: boolean }[];
  columnFilters?: { id: string; value: unknown }[];
  globalFilter?: string;
  columnVisibility?: Record<string, boolean>;
  rowSelection?: Record<string, boolean>;
}): Partial<DataTableSearchParams> {
  return {
    pagination: tableState.pagination
      ? {
          pageIndex: tableState.pagination.pageIndex,
          pageSize: tableState.pagination.pageSize,
        }
      : undefined,
    sorting: tableState.sorting ?? [],
    columnFilters: (tableState.columnFilters ?? []).map((filter) => {
      // Handle complex filter structures
      let value = filter.value;
      if (
        typeof value === "object" &&
        value !== null &&
        "values" in value &&
        "operator" in value
      ) {
        // Extract the first value from complex filter
        const complexFilter = value as { values: unknown[]; operator: string };
        value = complexFilter.values[0];
      }
      return {
        id: filter.id,
        value: value as
          | string
          | number
          | boolean
          | (string | number | boolean)[],
      };
    }),
    globalFilter: tableState.globalFilter ?? "",
    columnVisibility: tableState.columnVisibility ?? {},
    rowSelection: tableState.rowSelection ?? {},
  };
}

/**
 * Convert search params back to TanStack Table state format
 */
export function searchParamsToTableState(searchParams: DataTableSearchParams) {
  return {
    pagination: searchParams.pagination,
    sorting: searchParams.sorting,
    columnFilters: searchParams.columnFilters,
    globalFilter: searchParams.globalFilter,
    columnVisibility: searchParams.columnVisibility,
    rowSelection: searchParams.rowSelection,
  };
}

/**
 * Create a minimal search param object for simpler use cases
 * Useful when you only need basic pagination and search
 */
export function createMinimalSearchParams(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (params.page && params.page > 1) {
    result.page = params.page;
  }
  if (params.pageSize && params.pageSize !== 10) {
    result.pageSize = params.pageSize;
  }
  if (params.search?.trim()) {
    result.search = params.search;
  }
  if (params.sortBy?.trim()) {
    result.sortBy = params.sortBy;
    if (params.sortOrder && params.sortOrder !== "asc") {
      result.sortOrder = params.sortOrder;
    }
  }

  return result;
}

/**
 * Debounce function for URL updates
 * Prevents excessive navigation calls during rapid state changes
 */
export function createDebouncedUrlUpdate<T extends readonly unknown[]>(
  fn: (...args: T) => void,
  delay = 300
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
