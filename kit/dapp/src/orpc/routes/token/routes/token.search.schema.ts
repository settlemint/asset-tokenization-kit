import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for token search input parameters.
 *
 * Supports searching tokens by name, symbol, or address with fuzzy matching
 * for text fields and exact matching for addresses. This provides a more
 * flexible search experience compared to basic listing.
 */
export const TokenSearchInputSchema = z.object({
  /**
   * The search query string.
   *
   * This value is used to search across multiple token fields:
   * - Token name (case-insensitive, partial match)
   * - Token symbol (case-insensitive, partial match)
   * - Token address (exact match when valid address format)
   *
   * Must be at least 1 character long to perform a search.
   */
  query: z
    .string()
    .min(1)
    .describe("Search query for token name, symbol, or address"),

  /**
   * Maximum number of results to return.
   *
   * Since search is typically used for autocomplete or quick lookups,
   * we limit results to a reasonable number. Defaults to 10.
   */
  limit: z
    .number()
    .int()
    .positive()
    .max(50)
    .default(10)
    .describe("Maximum number of search results to return"),
});

/**
 * Schema for token search results.
 *
 * Returns a subset of token fields optimized for search display,
 * excluding detailed relational data that's not needed for search results.
 */
export const TokenSearchResultSchema = TokenSchema.omit({
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
  account: true,
  complianceModuleConfigs: true,
}).extend({
  account: z
    .object({
      identity: z
        .object({
          id: ethereumAddress.describe("The identity contract address"),
        })
        .describe("The identity associated with this token"),
    })
    .describe("The account associated with this token"),
});

/**
 * Schema for the search response.
 *
 */
export const TokenSearchResponseSchema = z.object({
  tokens: z.array(TokenSearchResultSchema),
});

export type TokenSearchInput = z.infer<typeof TokenSearchInputSchema>;
export type TokenSearchResult = z.infer<typeof TokenSearchResultSchema>;
export type TokenSearchResponse = z.infer<typeof TokenSearchResponseSchema>;
