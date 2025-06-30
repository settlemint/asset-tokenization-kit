import { z } from "zod/v4";

/**
 * Common list schema for paginated entity retrieval.
 *
 * This schema provides a standardized way to handle pagination across all
 * API endpoints that return lists of entities. It implements offset-based
 * pagination with configurable limits and sensible defaults to ensure
 * consistent behavior and performance across the application.
 *
 * The schema enforces reasonable constraints to prevent abuse:
 * - Offset must be non-negative (prevents invalid pagination)
 * - Limit is capped at 100 items (prevents excessive data transfer)
 * - Default values provide good UX without requiring parameters
 *
 * Used by endpoints like:
 * - GET /planets (list all planets)
 * - GET /users (list all users)
 * - GET /assets (list all assets)
 * - Any other multi-entity listing endpoint
 *
 * Usage in route contracts:
 * ```typescript
 * const listPlanets = contract.route({
 *   method: "GET",
 *   path: "/planets"
 * }).input(ListSchema);
 *
 * // Client usage with defaults:
 * const planets = await api.planets.list.query({}); // offset: 0, limit: 25
 *
 * // Client usage with custom pagination:
 * const planets = await api.planets.list.query({
 *   offset: 20,
 *   limit: 50
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
   * Controls the page size for pagination and prevents excessive
   * data transfer that could impact performance. The limit is
   * enforced both for client convenience and server protection.
   *
   * Constraints:
   * - Must be a positive integer (>= 1)
   * - Maximum allowed is 100 items per request
   * - Defaults to 25 (reasonable page size for most UIs)
   *
   * Example: limit: 25 returns up to 25 items in the response
   */
  limit: z.number().int().positive().max(100).default(25),

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
