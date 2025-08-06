/**
 * Data Table URL State Utilities
 *
 * Provides a reusable system for managing data table state in URLs
 * across the entire application. Handles type conversions, empty value
 * filtering, and complex filter structures.
 */

import { z } from "zod";
import type { DataTableSearchParams } from "./search-params";
import { dataTableSearchParamsSchema } from "./search-params";

/**
 * Creates a clean search params validator that removes empty values.
 * This prevents URLs from being cluttered with empty arrays and objects.
 *
 * @returns A function that parses and cleans search parameters
 */
export function createCleanSearchParamsValidator() {
  return (search: Record<string, unknown>) => {
    // Parse with the base schema
    const parsed = dataTableSearchParamsSchema.parse(search);

    // Remove empty values
    return cleanEmptyValues(parsed);
  };
}

/**
 * Removes empty arrays, objects, and falsy values from an object.
 * Also removes default pagination values to keep URLs clean.
 *
 * @param obj - The object to clean
 * @param defaultPageSize - Default page size to check against (default: 10)
 * @returns Cleaned object with empty values removed
 */
export function cleanEmptyValues(
  obj: Record<string, unknown>,
  defaultPageSize = 10
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  // Fields that are handled by flat params and should be skipped
  const internalFields = new Set([
    "pagination",
    "sorting",
    "columnFilters",
    "globalFilter",
    "columnVisibility",
    "rowSelection",
  ]);

  for (const [key, value] of Object.entries(obj)) {
    // Skip internal data table state fields
    if (internalFields.has(key)) {
      continue;
    }

    // Skip if undefined, null, or empty string
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    // Skip empty objects
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      continue;
    }

    // Remove default page size to clean URLs
    if (key === "limit" && value === defaultPageSize) {
      continue;
    }

    // For flat params, check defaults
    if (key === "page" && value === 1) {
      continue;
    }
    if (key === "pageSize" && value === defaultPageSize) {
      continue;
    }
    if (key === "sortOrder" && value === "asc") {
      continue; // asc is default
    }

    // Recursively clean nested objects
    if (typeof value === "object" && !Array.isArray(value)) {
      const cleanedNested = cleanEmptyValues(
        value as Record<string, unknown>,
        defaultPageSize
      );
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Base schema for flat URL parameters that transforms to nested structure.
 * Can be extended for specific table needs.
 * Transforms flat URL params into nested structure expected by DataTable.
 */
export const flatDataTableSearchParamsSchema = z
  .object({
    // Pagination
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).optional(),

    // Sorting
    sorting: z.string().optional(),

    // Filters
    filters: z.string().optional(),

    // Global search
    search: z.string().optional(),

    // Column visibility
    columns: z.string().optional(),

    // Row selection
    selected: z.string().optional(),
  })
  .transform((data) => {
    // Transform the flat URL params into the nested structure expected by DataTable
    return {
      pagination:
        data.page || data.pageSize
          ? {
              pageIndex: (data.page ?? 1) - 1,
              pageSize: data.pageSize ?? 10,
            }
          : undefined,
      sorting: data.sorting
        ? (JSON.parse(data.sorting) as Array<{ id: string; desc: boolean }>)
        : [],
      columnFilters: data.filters
        ? (JSON.parse(data.filters) as Array<{ id: string; value: unknown }>)
        : [],
      globalFilter: data.search ?? "",
      columnVisibility: data.columns
        ? (JSON.parse(data.columns) as Record<string, boolean>)
        : {},
      rowSelection: data.selected
        ? (JSON.parse(data.selected) as Record<string, boolean>)
        : {},
    };
  });

/**
 * Creates a route-specific search params validator.
 * Handles flat URL parameters and transforms them to internal table state.
 *
 * @example
 * ```tsx
 * const validateSearch = createDataTableSearchParams({
 *   defaultPageSize: 20,
 *   maxPageSize: 50,
 *   additionalParams: {
 *     status: z.enum(["active", "inactive"]).optional()
 *   }
 * });
 * ```
 *
 * @param options - Configuration options
 * @param options.defaultPageSize - Default page size (default: 10)
 * @param options.maxPageSize - Maximum allowed page size (default: 100)
 * @param options.additionalParams - Additional Zod schema fields
 * @returns Validator function for search parameters
 */
export function createDataTableSearchParams(options?: {
  defaultPageSize?: number;
  maxPageSize?: number;
  additionalParams?: z.ZodRawShape;
}) {
  const baseSchema = z.object({
    // Pagination
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce
      .number()
      .min(1)
      .max(options?.maxPageSize ?? 100)
      .optional(),

    // Sorting - flat parameters
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),

    // Filters - as individual parameters with filter_ prefix
    // This allows filter_status=active&filter_type=bond format

    // Global search
    search: z.string().optional(),

    // Column visibility - comma separated list of visible columns
    columns: z.string().optional(),

    // Row selection - comma separated list of selected row ids
    selected: z.string().optional(),

    // Additional params if needed
    ...options?.additionalParams,
  });

  return (search: Record<string, unknown>) => {
    // First parse the base schema to get standard params
    const baseParams: Record<string, unknown> = {};
    const filterParams: Record<string, string> = {};

    // Separate filter parameters from other params
    for (const [key, value] of Object.entries(search)) {
      if (key.startsWith("filter_")) {
        const filterKey = key.slice(7); // Remove 'filter_' prefix
        filterParams[filterKey] = String(value);
      } else {
        baseParams[key] = value;
      }
    }

    const parsed = baseSchema.parse(baseParams);

    // Transform flat params to internal structure
    const transformed: DataTableSearchParams & Record<string, unknown> = {
      pagination: {
        pageIndex: (parsed.page ?? 1) - 1,
        pageSize: parsed.pageSize ?? options?.defaultPageSize ?? 10,
      },
      sorting: parsed.sortBy
        ? [
            {
              id: parsed.sortBy,
              desc: parsed.sortOrder === "desc",
            },
          ]
        : [],
      columnFilters: Object.entries(filterParams).map(([id, value]) => ({
        id,
        value,
      })),
      globalFilter: parsed.search ?? "",
      columnVisibility: parsed.columns
        ? Object.fromEntries(
            parsed.columns.split(",").map((col) => [col, true])
          )
        : {},
      rowSelection: parsed.selected
        ? Object.fromEntries(parsed.selected.split(",").map((id) => [id, true]))
        : {},
    };

    // Add any additional params
    for (const [key, value] of Object.entries(parsed)) {
      if (
        ![
          "page",
          "pageSize",
          "sortBy",
          "sortOrder",
          "search",
          "columns",
          "selected",
        ].includes(key)
      ) {
        transformed[key] = value;
      }
    }

    return cleanEmptyValues(transformed, options?.defaultPageSize);
  };
}

/**
 * Helper to create type-safe route definitions with data table search params.
 * Wraps route configuration with a search params validator.
 *
 * @example
 * ```tsx
 * export const route = withDataTableSearchParams(
 *   {
 *     path: "/users",
 *     component: UsersPage
 *   },
 *   {
 *     defaultPageSize: 25,
 *     additionalParams: {
 *       role: z.enum(["admin", "user"]).optional()
 *     }
 *   }
 * );
 * ```
 *
 * @param routeConfig - Base route configuration object
 * @param searchParamsOptions - Options for the search params validator
 * @returns Route config with validateSearch function added
 */
export function withDataTableSearchParams<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  routeConfig: T,
  searchParamsOptions?: Parameters<typeof createDataTableSearchParams>[0]
) {
  return {
    ...routeConfig,
    validateSearch: createDataTableSearchParams(searchParamsOptions),
  };
}
