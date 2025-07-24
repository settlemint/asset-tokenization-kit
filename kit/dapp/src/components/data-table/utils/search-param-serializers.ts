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

import { z } from "zod";
import type {
  ColumnFilter,
  DataTableSearchParams,
  SortState,
} from "./search-params";

/**
 * Safely encode an object to JSON string for URL parameter.
 * Returns undefined if the object is empty or serialization fails.
 *
 * @param obj - Object to encode
 * @returns JSON string or undefined if empty/invalid
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
 * Safely decode a JSON string from URL parameter to object.
 * Returns fallback value if parsing fails.
 *
 * @param param - JSON string to decode
 * @param fallback - Default value if decoding fails
 * @returns Decoded object or fallback value
 */
export function decodeObjectParam<T>(
  param: string | undefined,
  fallback: T
): T {
  if (!param) return fallback;

  try {
    const parsed = JSON.parse(param) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serialize DataTable state for URL search parameters.
 * Omits default values to keep URLs clean.
 * Converts internal table state to flat URL parameters.
 *
 * @example
 * ```tsx
 * const urlParams = serializeDataTableState({
 *   pagination: { pageIndex: 1, pageSize: 20 },
 *   sorting: [{ id: "name", desc: false }],
 *   columnFilters: [{ id: "status", value: "active" }]
 * });
 * // Result: { page: 2, pageSize: 20, sortBy: "name", filter_status: "active" }
 * ```
 *
 * @param state - Table state object to serialize
 * @param defaultPageSize - Default page size for comparison (default: 10)
 * @returns Object suitable for URL search parameters
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
 * Deserialize URL search parameters to DataTable state.
 * Provides safe fallbacks for all properties.
 * Converts flat URL parameters back to internal table state.
 *
 * @example
 * ```tsx
 * const tableState = deserializeDataTableState({
 *   page: "2",
 *   pageSize: "20",
 *   sortBy: "name",
 *   sortOrder: "desc",
 *   filter_status: "active"
 * });
 * ```
 *
 * @param searchParams - URL search parameters object
 * @returns Normalized table state with safe defaults
 */
export function deserializeDataTableState(
  searchParams: Record<string, unknown>
): DataTableSearchParams {
  // Parse each field individually to handle partial failures gracefully
  // For numeric values, coerce and then clamp to valid range
  const pageRaw = z.coerce.number().safeParse(searchParams.page);
  const pageSizeRaw = z.coerce.number().safeParse(searchParams.pageSize);

  const page = pageRaw.success
    ? {
        success: true as const,
        data: Math.max(1, Math.min(1000, Math.floor(pageRaw.data))),
      }
    : { success: false as const };
  const pageSize = pageSizeRaw.success
    ? {
        success: true as const,
        data: Math.max(1, Math.min(100, Math.floor(pageSizeRaw.data))),
      }
    : { success: false as const };
  const sortBy = z
    .string()
    .regex(/^[a-zA-Z0-9_.-]+$/)
    .max(100)
    .safeParse(searchParams.sortBy);
  const sortOrder = z.enum(["asc", "desc"]).safeParse(searchParams.sortOrder);
  const search = z.string().max(1000).safeParse(searchParams.search);
  const columns = z
    .string()
    .max(1000)
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const cols = val.split(",").map((c) => c.trim());
      const validCols = cols.filter((col) => /^[a-zA-Z0-9_.-]+$/.test(col));
      return validCols.length > 0 ? validCols.join(",") : undefined;
    })
    .safeParse(searchParams.columns);
  const selected = z
    .string()
    .max(1000)
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const ids = val.split(",").map((id) => id.trim());
      const validIds = ids.filter((id) => /^[a-zA-Z0-9_.-]+$/.test(id));
      return validIds.length > 0 ? validIds.join(",") : undefined;
    })
    .safeParse(searchParams.selected);

  const pageValue = page.success ? page.data : 1;
  const pageSizeValue = pageSize.success ? pageSize.data : 10;

  // Sorting from flat params
  const sorting: SortState[] =
    sortBy.success && sortBy.data
      ? [
          {
            id: sortBy.data,
            desc: sortOrder.success && sortOrder.data === "desc",
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
      const filterKey = key.slice(7); // Remove 'filter_' prefix
      const stringValue = z.string().max(1000).safeParse(value);
      if (stringValue.success) {
        columnFilters.push({
          id: filterKey,
          value: stringValue.data,
        });
      }
    }
  });

  // Column visibility from comma-separated list
  const columnVisibility: Record<string, boolean> = {};
  if (columns.success && columns.data) {
    columns.data.split(",").forEach((col) => {
      columnVisibility[col] = true;
    });
  }

  // Row selection from comma-separated list
  const rowSelection: Record<string, boolean> = {};
  if (selected.success && selected.data) {
    selected.data.split(",").forEach((id) => {
      rowSelection[id] = true;
    });
  }

  return {
    pagination: {
      pageIndex: Math.max(0, pageValue - 1), // Convert from 1-based to 0-based
      pageSize: pageSizeValue,
    },
    sorting,
    columnFilters,
    globalFilter: search.success ? search.data : "",
    columnVisibility,
    rowSelection,
  };
}

/**
 * Convert TanStack Table state to our search param format.
 * Handles the conversion between different state structures.
 *
 * @param tableState - TanStack table state object
 * @returns Normalized search params format
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
 * Convert search params back to TanStack Table state format.
 *
 * @param searchParams - Normalized search params
 * @returns TanStack table state object
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
 * Create a minimal search param object for simpler use cases.
 * Useful when you only need basic pagination and search.
 *
 * @example
 * ```tsx
 * const params = createMinimalSearchParams({
 *   page: 2,
 *   search: "john",
 *   sortBy: "name"
 * });
 * ```
 *
 * @param params - Basic search parameters
 * @returns Cleaned URL parameter object
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
 * Debounce function for URL updates.
 * Prevents excessive navigation calls during rapid state changes.
 *
 * @example
 * ```tsx
 * const debouncedNavigate = createDebouncedUrlUpdate(
 *   (params) => navigate({ search: params }),
 *   500
 * );
 * ```
 *
 * @param fn - Function to debounce
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns Debounced function
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
