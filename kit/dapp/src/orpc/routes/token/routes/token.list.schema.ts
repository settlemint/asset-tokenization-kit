import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod/v4";

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
export const TokenListSchema = z.array(TokenSchema);

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

// Type exports for enhanced TypeScript integration
export type TokenList = z.infer<typeof TokenListSchema>;
export type TokensResponse = z.infer<typeof TokensResponseSchema>;
