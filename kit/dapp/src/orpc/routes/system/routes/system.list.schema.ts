import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { z } from "zod";

/**
 * Schema definition for a SMART System entity.
 *
 * Systems are the core infrastructure contracts in the SMART protocol that
 * orchestrate the deployment and management of tokenized assets. Each system
 * manages its own set of factories, registries, and compliance modules.
 *
 * @remarks
 * The system ID is the blockchain address where the system contract is deployed.
 * This address serves as the unique identifier for all operations within that
 * particular SMART protocol instance.
 */
export const SystemSchema = z.object({
  /**
   * Unique identifier of the system - the Ethereum address of the deployed system contract.
   * This address is used to interact with the system and all its associated components.
   */
  id: ethereumAddress,
});

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
export const SystemListInputSchema = ListSchema;

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

// Type exports for enhanced TypeScript integration
export type System = z.infer<typeof SystemSchema>;
export type SystemListItem = z.infer<typeof SystemListItemSchema>;
export type SystemList = z.infer<typeof SystemListSchema>;
export type SystemListInput = z.infer<typeof SystemListInputSchema>;
export type SystemsResponse = z.infer<typeof SystemsResponseSchema>;
