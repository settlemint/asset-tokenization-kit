import { z } from "zod";

/**
 * Common list schema for paginated entity retrieval with auto-pagination support.
 *
 * This schema provides a standardized way to handle pagination across all
 * API endpoints that return lists of entities. It implements offset-based
 * pagination with configurable limits and automatic batching for large queries.
 *
 * Auto-pagination features:
 * - Queries requesting >1000 items or unlimited queries are automatically split into batches
 * - Each batch is limited to 1000 items (GraphQL query limit)
 * - Results are merged transparently without client-side changes
 * - Optimal performance through parallel batch processing
 *
 * The schema enforces reasonable constraints:
 * - Offset must be non-negative (prevents invalid pagination)
 * - Limit is optional (undefined = get all records) or capped at 100,000 items (with auto-pagination)
 * - Default values optimized for GraphQL performance
 *
 * Used by endpoints like:
 * - GET /tokens (list all tokens - auto-paginated for large datasets)
 * - GET /systems (list all systems)
 * - GET /factories (list all token factories)
 * - Any other multi-entity listing endpoint
 *
 * Usage in route contracts:
 * ```typescript
 * const listTokens = contract.route({
 *   method: "GET",
 *   path: "/tokens"
 * }).input(ListSchema);
 *
 * // Client usage with defaults (single batch):
 * const tokens = await api.tokens.list.query({}); // offset: 0, no limit = get all
 *
 * // Client usage with auto-pagination (transparent):
 * const someTokens = await api.tokens.list.query({
 *   offset: 0,
 *   limit: 5000 // Automatically batched into 5 requests
 * });
 *
 * // Get all available records (unlimited):
 * const allTokens = await api.tokens.list.query({
 *   offset: 0 // No limit specified = get everything
 * });
 * ```
 */
export const ListSchema = z.object({
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

  /**
   * Sort order direction for the results.
   *
   * Determines whether the results should be sorted in ascending
   * or descending order when combined with the orderBy field.
   *
   * Defaults to ascending order.
   */
  orderDirection: z.enum(["asc", "desc"]).default("asc"),

  /**
   * Field name to sort the results by.
   *
   * Specifies which field should be used for ordering the results.
   * The actual available fields depend on the specific entity being queried.
   *
   * Defaults to ordering by id.
   */
  orderBy: z.string().default("id"),
});

// Type export for use in handlers and utilities
export type ListInput = z.infer<typeof ListSchema>;
