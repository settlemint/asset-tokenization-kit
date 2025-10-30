import { z } from "zod";

/**
 * Schema for a simplified system object used in GraphQL list responses.
 *
 * Uses string validation instead of ethereumAddress to match GraphQL's
 * type coercion behavior where addresses are returned as plain strings
 * from TheGraph subgraph queries.
 */
export const SystemListItemSchema = z.object({
  /**
   * System contract address as a string from GraphQL response.
   *
   * Note: This differs from SystemSchema.id which uses ethereumAddress
   * validation. The discrepancy exists because GraphQL responses return
   * addresses as strings, while individual system operations require
   * proper Ethereum address validation.
   */
  id: z.string().describe("System contract address from GraphQL"),
});

/**
 * Schema for validating an array of systems from GraphQL responses.
 *
 * Used for bulk system operations and list views where multiple systems
 * are returned. Each system in the array is validated using the simplified
 * SystemListItemSchema appropriate for GraphQL string responses.
 */
export const SystemListSchema = z.array(SystemListItemSchema);

/**
 * Schema for system list queries with auto-pagination support.
 *
 * Extends the base ListSchema to provide consistent pagination behavior
 * across all system-related endpoints. Supports unlimited queries and
 * large result sets through automatic batching.
 */

/**
 * Schema for validating GraphQL query responses from TheGraph.
 *
 * Wraps the array of systems in a response object to match TheGraph's
 * response structure. Provides type safety and runtime validation for
 * data returned from the subgraph, with full auto-pagination support.
 *
 * Auto-pagination capabilities:
 * - Handles unlimited system queries (no limit specified)
 * - Automatically batches requests exceeding 1000 systems
 * - Merges multiple batch responses seamlessly
 * - Maintains sort order across paginated results
 *
 * @example
 * ```typescript
 * // Standard query (≤1000 systems)
 * const response = SystemsResponseSchema.parse({
 *   systems: [{ id: "0x123..." }, { id: "0x456..." }]
 * });
 *
 * // Auto-paginated unlimited query
 * const allSystems = await client.systems.list.query({
 *   // No limit = get all systems via auto-pagination
 * });
 *
 * // Large bounded query
 * const manySystems = await client.systems.list.query({
 *   limit: 5000 // Automatically batched into 5 requests
 * });
 * ```
 */
export const SystemsResponseSchema = z.object({
  systems: SystemListSchema,
});
