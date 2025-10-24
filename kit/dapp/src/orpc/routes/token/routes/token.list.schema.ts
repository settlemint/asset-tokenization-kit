import { SortableListSchema } from "@/orpc/routes/common/schemas/sortable-list.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Schema for validating an array of tokens from GraphQL responses.
 *
 * This schema ensures that each token in the array conforms to the
 * TokenSchema structure, providing runtime validation and type safety.
 * Used primarily for bulk token operations, list views, and auto-pagination
 * results where multiple tokens are returned.
 *
 * Why we omit certain fields from the base TokenSchema:
 * 1. Performance: List views don't need detailed metadata (collateral, yield, etc.)
 * 2. API Efficiency: Reduces payload size for large token lists
 * 3. Use Case Alignment: List operations focus on basic identification and filtering
 * 4. Lazy Loading: Detailed data is fetched only when viewing individual tokens
 *
 * Extensions for price data:
 * - price: Extracted from identity claims for financial assets
 * - assetClassification: Determines UI behavior and feature availability
 *
 * These extensions transform the base token data into a UI-friendly format
 * without requiring changes to the underlying GraphQL schema.
 *
 * @example
 * ```typescript
 * // Validates an array of token objects with price data
 * const tokens = TokenListSchema.parse([
 *   {
 *     id: "0x123...",
 *     name: "Corporate Bond",
 *     symbol: "BOND1",
 *     decimals: 18,
 *     price: { amount: "1000.00", currencyCode: "USD", decimals: 2 },
 *     assetClassification: { class: "debt", category: "corporate_bond" }
 *   },
 *   {
 *     id: "0x456...",
 *     name: "Utility Token",
 *     symbol: "UTIL",
 *     decimals: 6,
 *     // No price or classification for utility tokens
 *   }
 * ]);
 * ```
 */
export const TokenListSchema = z.array(
  TokenSchema.omit({
    collateral: true,
    yield: true,
    fund: true,
    bond: true,
    redeemable: true,
    capped: true,
    createdBy: true,
    extensions: true,
    implementsERC3643: true,
    implementsSMART: true,
    stats: true,
    identity: true,
    complianceModuleConfigs: true,
    accessControl: true,
    userPermissions: true,
  })
);

/**
 * Schema for validating the GraphQL query response from TheGraph.
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
 * Why tokenFactory filtering is critical:
 * 1. Multi-tenancy: Different organizations may deploy separate factory contracts
 * 2. Asset Isolation: Prevents cross-contamination between different tokenization systems
 * 3. Performance: Reduces query scope and improves GraphQL query efficiency
 * 4. Security: Ensures users only see tokens they have access to through their factory
 *
 * @example
 * ```typescript
 * // Query tokens from a specific factory
 * const tokens = await api.token.list.query({
 *   tokenFactory: "0x123...",
 * });
 *
 * // Multi-factory environments (separate calls for isolation)
 * const factoryATokens = await api.token.list.query({ tokenFactory: "0xA..." });
 * const factoryBTokens = await api.token.list.query({ tokenFactory: "0xB..." });
 * ```
 */
export const TokenListInputSchema = SortableListSchema.extend({
  /**
   * The token factory contract address for filtering tokens.
   *
   * Why this parameter drives the entire query:
   * 1. Data Isolation: Ensures logical separation between different token ecosystems
   * 2. GraphQL Efficiency: Allows TheGraph to use indexed queries for better performance
   * 3. Business Logic: Aligns with the platform's multi-tenant architecture
   * 4. Security Boundary: Factory address determines access scope for token data
   *
   * Optional Design Decision: Made optional to support "all factories" queries in admin interfaces,
   * but the GraphQL query requires it, so the handler validates presence at runtime.
   * This provides flexibility while maintaining type safety.
   *
   * Must be a valid Ethereum contract address when provided.
   */
  tokenFactory: ethereumAddress
    .optional()
    .describe("The token factory contract address to filter tokens by"),
});

/**
 * Schema for validating the token list response with total count.
 */
export const TokenListResponseSchema = z.object({
  /** Array of tokens for the current page */
  tokens: TokenListSchema,
  /** Total number of tokens available across all pages */
  totalCount: z.number().int().nonnegative(),
});

/**
 * Type exports for enhanced TypeScript integration across the application.
 *
 * Why we export these specific types:
 * 1. API Contract: TokenListInput ensures consistent parameter validation
 * 2. Data Flow: TokenList provides type safety for processed token data
 * 3. GraphQL Integration: TokensResponse matches TheGraph query structure
 * 4. Component Props: UI components can import these for proper typing
 *
 * These types bridge the gap between runtime validation (Zod) and compile-time
 * type checking (TypeScript), ensuring end-to-end type safety from API to UI.
 */

/** Input parameters for token listing queries, with validation */
export type TokenListInput = z.infer<typeof TokenListInputSchema>;

/** Array of tokens with price and classification data included */
export type TokenList = z.infer<typeof TokenListSchema>;

/** GraphQL response structure from TheGraph token queries */
export type TokensResponse = z.infer<typeof TokensResponseSchema>;

/** Response structure with tokens and total count */
export type TokenListResponse = z.infer<typeof TokenListResponseSchema>;
