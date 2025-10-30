import { SortableListSchema } from "@/orpc/routes/common/schemas/sortable-list.schema";
import { assetExtensionArray } from "@atk/zod/asset-extensions";
import { assetFactoryTypeId } from "@atk/zod/asset-types";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for a token factory in the list
 */
export const TokenFactorySchema = z.object({
  /**
   * The factory contract address
   */
  id: ethereumAddress.describe("The factory contract address"),

  /**
   * The name of the token factory
   */
  name: z.string().describe("The name of the token factory"),

  /**
   * The type ID of the token factory
   */
  typeId: assetFactoryTypeId().describe("The type ID of the token factory"),

  /**
   * Whether the factory has created any tokens
   */
  hasTokens: z.boolean().describe("Whether the factory has created any tokens"),

  /**
   * The token extensions of the token factory
   */
  tokenExtensions: assetExtensionArray().describe(
    "The token extensions of the token factory"
  ),
});

/**
 * Schema for the list of token factories
 * Following the same pattern as TokenListSchema
 */
export const FactoryListSchema = z.array(TokenFactorySchema);

/**
 * List schema for token factories that extends the base ListSchema
 * with an optional filter for factories that have created tokens.
 */
export const TokenFactoryListSchema = SortableListSchema.extend({
  /**
   * Filter factories by whether they have created tokens.
   *
   * When not specified, all factories are returned.
   * When true, only factories with tokens are returned.
   * When false, only factories without tokens are returned.
   */
  hasTokens: z
    .boolean()
    .optional()
    .describe("Filter factories by whether they have created tokens"),
});

/**
 * Schema for validating the GraphQL query response from TheGraph.
 *
 * Wraps the array of token factories in a response object to match TheGraph's
 * response structure. This ensures type safety and runtime validation of the
 * data returned from the subgraph, with full support for auto-pagination.
 *
 * Auto-pagination integration:
 * - Automatically handles queries requesting >1000 factories
 * - Merges results from multiple 1000-item batches seamlessly
 * - Maintains filtering consistency across paginated requests
 * - Validates each batch response before merging
 *
 * @example
 * ```typescript
 * // Standard query (≤1000 factories)
 * const response = FactoriesResponseSchema.parse({
 *   tokenFactories: [
 *     { id: "0x123...", name: "BondFactory", typeId: "bond", hasTokens: true }
 *   ]
 * });
 *
 * // Auto-paginated query with filtering
 * const activeFactories = await client.factories.list.query({
 *   hasTokens: true,
 *   limit: 5000 // Automatically paginated with filter preserved
 * });
 *
 * // Unlimited query (gets all factories)
 * const allFactories = await client.factories.list.query({
 *   // No limit = fetch everything via auto-pagination
 * });
 * ```
 */
export const FactoriesResponseSchema = z.object({
  system: z.object({
    tokenFactoryRegistry: z
      .object({
        tokenFactories: FactoryListSchema,
      })
      .nullable(),
  }),
});

// Type exports for enhanced TypeScript integration
export type TokenFactory = z.infer<typeof TokenFactorySchema>;
export type FactoryList = z.infer<typeof FactoryListSchema>;
export type TokenFactoryListInput = z.infer<typeof TokenFactoryListSchema>;
export type FactoriesResponse = z.infer<typeof FactoriesResponseSchema>;
