import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenHoldersResponseSchema } from "@/orpc/routes/token/routes/token.holders.schema";

/**
 * GraphQL query for retrieving token holders and their balances.
 *
 * This query fetches all balance entries for a specific token, ordered by
 * last updated time in descending order. Each balance entry includes:
 * - available: The amount of tokens available for transfer
 * - frozen: The amount of tokens frozen/locked
 * - isFrozen: Boolean flag indicating if the balance is frozen
 * - value: The total balance value
 *
 * @remarks
 * The balances are ordered by lastUpdatedAt in descending order to show
 * the most recently active holders first.
 */
const TOKEN_HOLDERS_QUERY = theGraphGraphql(`
  query TokenHoldersQuery($id: ID!) {
    token(id: $id) {
      balances @fetchAll {
        account {
          id
        }
        available
        frozen
        isFrozen
        value
        lastUpdatedAt
      }
    }
  }
`);

/**
 * Token holders route handler.
 *
 * Retrieves a list of all token holders for a specific token, including their
 * balance information. This endpoint is useful for displaying token holder
 * distributions, compliance reporting, and administrative interfaces.
 *
 * Authentication: Required (uses token router)
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/{tokenAddress}/holders
 *
 * @param context - Request context with TheGraph client and token from middleware
 * @returns Promise<TokenHoldersResponse> - Token with array of balance objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all holders for a specific token
 * const holders = await orpc.token.holders.query({
 *   tokenAddress: '0x1234567890abcdef...'
 * });
 *
 * // Access the balance information
 * holders.token?.balances.forEach(balance => {
 *   console.log(`Value: ${balance.value}, Available: ${balance.available}`);
 * });
 * ```
 *
 * @see {@link TokenHoldersResponseSchema} for the response structure
 */
export const holders = tokenRouter.token.holders.handler(
  async ({ context }) => {
    const response = await context.theGraphClient.query(TOKEN_HOLDERS_QUERY, {
      input: {
        id: context.token.id.toLowerCase(),
      },
      output: TokenHoldersResponseSchema,
    });

    return response;
  }
);
