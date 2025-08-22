import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenSearchResponseSchema } from "@/orpc/routes/token/routes/token.search.schema";
import { isAddress } from "viem";

/**
 * GraphQL query for searching tokens by name, symbol, or address.
 *
 * This query supports flexible searching across multiple token attributes:
 * - Name: Case-insensitive partial matching
 * - Symbol: Case-insensitive partial matching
 * - Address: Exact match for valid Ethereum addresses
 *
 * Results are limited and ordered by relevance (name first).
 */
const SEARCH_TOKEN_QUERY = theGraphGraphql(`
  query SearchTokenQuery($search: String, $searchAddress: Bytes, $limit: Int!) {
    tokens(
      where: {
        or: [
          { name_contains_nocase: $search },
          { symbol_contains_nocase: $search },
          { id: $searchAddress }
        ]
      },
      first: $limit,
      orderBy: name,
      orderDirection: asc
    ) {
      id
      type
      createdAt
      name
      symbol
      decimals
      totalSupply
      pausable {
        paused
      }
    }
  }
`);

/**
 * Token search route handler.
 *
 * Provides flexible search functionality for tokens by name, symbol, or address.
 * This endpoint is optimized for autocomplete, search suggestions, and quick lookups
 * where users need to find specific tokens without browsing full lists.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on tokens
 * Method: GET /token/search
 *
 * @param input - Search parameters including query string and result limit
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<Token[]> - Array of tokens matching the search criteria
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Search for tokens by name
 * const tokens = await orpc.token.search.query({
 *   query: "USD",
 *   limit: 10
 * });
 *
 * // Search by token address
 * const tokenByAddress = await orpc.token.search.query({
 *   query: "0x123...abc",
 *   limit: 1
 * });
 *
 * // Search with partial symbol match
 * const symbolMatches = await orpc.token.search.query({
 *   query: "ETH"
 * });
 * ```
 *
 * @see {@link TokenSearchInputSchema} for the input parameters
 * @see {@link TokenSearchResponseSchema} for the response structure
 */
export const search = authRouter.token.search
  .handler(async ({ input, context }) => {
    const { query, limit } = input;

    // Prepare search variables
    const variables: {
      search: string;
      searchAddress?: string;
      limit: number;
    } = {
      search: query,
      limit,
    };

    // If the query looks like an Ethereum address, include it as searchAddress
    // This allows exact matching for addresses while still doing fuzzy search on text
    if (isAddress(query)) {
      variables.searchAddress = query.toLowerCase();
    }

    // Execute the search query
    const response = await context.theGraphClient.query(SEARCH_TOKEN_QUERY, {
      input: variables,
      output: TokenSearchResponseSchema,
    });

    return response.tokens;
  });
