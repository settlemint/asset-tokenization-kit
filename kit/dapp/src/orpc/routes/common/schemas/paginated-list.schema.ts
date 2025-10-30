import { SortableListSchema } from "@/orpc/routes/common/schemas/sortable-list.schema";
import { z } from "zod";

/**
 * Schema for paginating a list of items.
 *
 * This schema extends the sortable list schema to add pagination support.
 * Use `orderDirection` to specify ascending ("asc") or descending ("desc") sort order.
 * The `orderBy` field sets which field is used for sorting the results.
 * Use `offset` and `limit` for standard offset-based pagination.
 *
 * @example
 * ```typescript
 * const input: PaginatedListInput = {
 *   orderDirection: "asc",
 *   orderBy: "createdAt",
 *   offset: 0,
 *   limit: 50,
 * };
 * ```
 * ```
 */
export const PaginatedListSchema = SortableListSchema.extend({
  /**
   * Pagination offset.
   *
   * The number of items to skip before starting to return results.
   * This enables offset-based pagination where clients can navigate
   * through large datasets by incrementing the offset.
   *
   * Constraints:
   * - Must be a non-negative integer (>= 0)
   * - Defaults to 0 (start from the beginning)
   *
   * Example: offset: 20 with limit: 10 returns items 21-30
   */
  offset: z.number().int().nonnegative().default(0),

  /**
   * Maximum number of items to return.
   *
   * Controls the page size for pagination. Auto-pagination is triggered
   * for queries requesting more than 200 items or when no limit is specified
   * to work around GraphQL query limits while maintaining optimal performance.
   *
   * Constraints:
   * - Must be a positive integer (>= 1) when specified
   * - Maximum allowed is 200 items per request (with auto-pagination)
   * - Optional - defaults to 100 items when not specified
   *
   * Examples:
   * - limit: 200 returns up to 200 items
   * - limit: undefined (or omitted) defaults to 100 items
   */
  limit: z.number().int().positive().max(200).optional(),
});

// Type export for use in handlers and utilities
export type PaginatedListInput = z.infer<typeof PaginatedListSchema>;
