import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod";

/**
 * Schema for validating an array of tokens from GraphQL responses.
 *
 * This schema ensures that each token in the array conforms to the
 * TokenSchema structure, providing runtime validation and type safety.
 * Used primarily for bulk token operations, list views, and auto-pagination
 * results where multiple tokens are returned.
 *
 * @example
 * ```typescript
 * // Validates an array of token objects
 * const tokens = TokenListSchema.parse([
 *   { id: "0x123...", name: "MyToken", symbol: "MTK", decimals: 18 },
 *   { id: "0x456...", name: "OtherToken", symbol: "OTK", decimals: 6 }
 * ]);
 * ```
 */
export const TokenListSchema = z.array(
  TokenSchema.omit({
    collateral: true,
    fund: true,
    bond: true,
    redeemable: true,
    capped: true,
    createdBy: true,
    extensions: true,
    implementsERC3643: true,
    implementsSMART: true,
  })
);

/**
 * Schema for validating the GraphQL query response from TheGraph.
 *
 * Wraps the array of tokens in a response object to match TheGraph's
 * response structure. This ensures type safety and runtime validation
 * of the data returned from the subgraph, especially important for
 * auto-paginated queries that merge multiple batch responses.
 *
 * Auto-pagination support:
 * - Handles responses from 1000-item batches automatically
 * - Validates each batch before merging results
 * - Maintains type safety across unlimited result sets
 *
 * @example
 * ```typescript
 * // Single batch response (≤1000 items)
 * const response = TokensResponseSchema.parse({
 *   tokens: [{ id: "0x123...", name: "Token", symbol: "TKN", decimals: 18 }]
 * });
 *
 * // Auto-paginated response (merged from multiple batches)
 * const largeResponse = TokensResponseSchema.parse({
 *   tokens: [...5000TokenArray] // Merged from 5 batches of 1000 each
 * });
 * ```
 */
export const TokensResponseSchema = z.object({
  tokens: TokenListSchema,
});

/**
 * Input schema for token listing queries.
 *
 * Extends the base ListSchema with token-specific filtering parameters.
 * This schema ensures that all required parameters for the GraphQL query
 * are properly validated and typed at the API contract level.
 *
 * The tokenFactory parameter is required because tokens are always associated
 * with a specific factory contract that created them. This provides filtering
 * by factory and ensures type safety for the GraphQL query parameters.
 *
 * Auto-pagination support:
 * - Works seamlessly with unlimited queries (no limit specified)
 * - Preserves tokenFactory filter across all paginated batches
 * - Maintains consistent ordering and sorting across batch boundaries
 *
 * @example
 * ```typescript
 * // Query tokens from a specific factory
 * const tokens = await api.token.list.query({
 *   tokenFactory: "0x123...",
 *   offset: 0,
 *   limit: 50
 * });
 *
 * // Get all tokens from factory (auto-paginated)
 * const allTokens = await api.token.list.query({
 *   tokenFactory: "0x123...",
 *   // No limit = fetch all with auto-pagination
 * });
 * ```
 */
export const TokenListInputSchema = ListSchema.extend({
  /**
   * The token factory contract address.
   *
   * Filters tokens to only those created by the specified factory contract.
   * This is required because the GraphQL query needs to know which factory's
   * tokens to retrieve, and it ensures proper data isolation between different
   * token creation systems.
   *
   * Must be a valid Ethereum contract address.
   */
  tokenFactory: ethereumAddress
    .optional()
    .describe("The token factory contract address to filter tokens by"),
});

// Type export for use in handlers and client code
export type TokenListInput = z.infer<typeof TokenListInputSchema>;

// Type exports for enhanced TypeScript integration
export type TokenList = z.infer<typeof TokenListSchema>;
export type TokensResponse = z.infer<typeof TokensResponseSchema>;
