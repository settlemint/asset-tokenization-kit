/**
 * Search Parameter Type Definitions
 *
 * This module defines type-safe schemas and types for managing DataTable state
 * through TanStack Router search parameters. It provides Zod schemas for validation
 * and serialization of complex table state objects.
 *
 * The search param state includes:
 * - Pagination (page, pageSize)
 * - Sorting (sortBy, sortDirection)
 * - Filtering (columnFilters, globalFilter)
 * - Column visibility
 * - Row selection
 * @see {@link https://tanstack.com/router/latest/docs/framework/react/guide/search-params} - TanStack Router search params
 * @see {@link https://zod.dev} - Zod validation library
 */

import * as z from "zod";

/**
 * Schema for individual column filter state
 * Represents a filter applied to a specific column
 */
export const columnFilterSchema = z.object({
  /** Column identifier */
  id: z.string(),
  /** Filter value - can be string, number, boolean, or array */
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
  ]),
});

/**
 * Schema for sort state
 * Represents the current sort configuration
 */
export const sortStateSchema = z.object({
  /** Column ID to sort by */
  id: z.string(),
  /** Sort direction */
  desc: z.boolean(),
});

/**
 * Schema for pagination state
 */
export const paginationStateSchema = z.object({
  /** Current page index (0-based) */
  pageIndex: z.number().min(0).catch(0),
  /** Number of items per page */
  pageSize: z.number().min(1).max(100).catch(10),
});

/**
 * Schema for column visibility state
 * Maps column IDs to their visibility state
 */
export const columnVisibilitySchema = z.record(z.string(), z.boolean());

/**
 * Schema for row selection state
 * Maps row IDs to their selection state
 */
export const rowSelectionSchema = z.record(z.string(), z.boolean());

/**
 * Complete DataTable search parameter schema
 * This schema validates and types all possible table state that can be persisted in URL
 */
export const dataTableSearchParamsSchema = z.object({
  /** Pagination state */
  pagination: paginationStateSchema.optional(),
  /** Sorting state array */
  sorting: z.array(sortStateSchema).catch([]),
  /** Column filter state array */
  columnFilters: z.array(columnFilterSchema).catch([]),
  /** Global filter/search value */
  globalFilter: z.string().catch(""),
  /** Column visibility state */
  columnVisibility: columnVisibilitySchema.catch({}),
  /** Row selection state */
  rowSelection: rowSelectionSchema.catch({}),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type ColumnFilter = z.infer<typeof columnFilterSchema>;
export type SortState = z.infer<typeof sortStateSchema>;
export type PaginationState = z.infer<typeof paginationStateSchema>;
export type ColumnVisibility = z.infer<typeof columnVisibilitySchema>;
export type RowSelection = z.infer<typeof rowSelectionSchema>;
export type DataTableSearchParams = z.infer<typeof dataTableSearchParamsSchema>;

/**
 * Default values for search parameters
 */
export const DEFAULT_SEARCH_PARAMS: DataTableSearchParams = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  columnVisibility: {},
  rowSelection: {},
} as const;

/**
 * Minimal search params schema for routes that only need basic table state
 * Useful for simpler tables that don't need all features
 */
export const minimalDataTableSearchParamsSchema = z.object({
  /** Current page (1-based for user-friendly URLs) */
  page: z.number().min(1).catch(1),
  /** Page size */
  pageSize: z.number().min(1).max(100).catch(10),
  /** Search/filter term */
  search: z.string().catch(""),
  /** Sort column */
  sortBy: z.string().catch(""),
  /** Sort direction */
  sortOrder: z.enum(["asc", "desc"]).catch("asc"),
});

export type MinimalDataTableSearchParams = z.infer<
  typeof minimalDataTableSearchParamsSchema
>;
