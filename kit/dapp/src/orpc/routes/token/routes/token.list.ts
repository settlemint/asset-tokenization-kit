import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokensResponseSchema } from "@/orpc/routes/token/routes/token.list.schema";

/**
 * GraphQL query for retrieving tokenized assets from TheGraph.
 *
 * Tokens represent tokenized real-world assets (RWAs) or digital assets
 * created through token factories. Each token has standard ERC-20 properties
 * like name, symbol, and decimals, but may also include additional compliance
 * and permission features for regulated assets.
 *
 * This query supports:
 * - Paginated retrieval using skip/first parameters
 * - Flexible sorting by any Token field (name, symbol, etc.)
 * - Ordered results in ascending or descending direction
 *
 * @remarks
 * The subgraph indexes all deployed token contracts, regardless of their
 * current state or whether they have any holders.
 */
const LIST_TOKEN_QUERY = theGraphGraphql(`
  query ListTokenQuery($tokenFactory: String!, $skip: Int!, $first: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection) {
    tokens(
        where: {tokenFactory: $tokenFactory}
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        id
        name
        symbol
        decimals
      }
    }
  `);

/**
 * Token listing route handler.
 *
 * Retrieves a paginated list of all tokenized assets indexed by the subgraph.
 * This endpoint provides a comprehensive view of all tokens in the system,
 * useful for token explorers, portfolio views, and administrative interfaces.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on tokens
 * Method: GET /token
 *
 * @param input - List parameters including pagination and sorting
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<Token[]> - Array of token objects with basic metadata
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all tokens with default pagination
 * const tokens = await orpc.token.list.query({});
 *
 * // Get tokens sorted by symbol
 * const tokensBySymbol = await orpc.token.list.query({
 *   orderBy: 'symbol',
 *   orderDirection: 'asc'
 * });
 *
 * // Get second page of tokens (50 per page)
 * const page2 = await orpc.token.list.query({
 *   offset: 50,
 *   limit: 50
 * });
 * ```
 *
 * @see {@link TokenListSchema} for the response structure
 * @see {@link ListSchema} for pagination parameters
 */
export const list = authRouter.token.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const response = await context.theGraphClient.query(LIST_TOKEN_QUERY, {
      input: {
        input,
      },
      output: TokensResponseSchema,
      error: "Failed to list tokens",
    });

    return response.tokens;
  });
