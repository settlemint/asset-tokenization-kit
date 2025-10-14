import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { assetBalance } from "@atk/zod/asset-balance";
import * as z from "zod";

/**
 * GraphQL query for retrieving a specific holder's balance for a token.
 *
 * This query fetches the balance information for a specific holder of a token,
 * including available balance, frozen amounts, and status information. The query
 * filters balances by the specific holder address and limits to 1 result since
 * each holder should only have one balance entry per token.
 *
 * @param tokenId - The token contract address (lowercased)
 * @param holderAddress - The holder's wallet address (lowercased)
 */
const TOKEN_HOLDER_QUERY = theGraphGraphql(`
  query TokenHolderQuery($tokenId: ID!, $holderAddress: String!) {
    token(id: $tokenId) {
      balances(where: {account: $holderAddress}, first: 1) {
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
 * Token holder route handler.
 *
 * Retrieves balance information for a specific holder of a token.
 * Returns null in the holder field if the address has no balance or
 * doesn't exist as a holder of the token.
 *
 * Authentication: Required (uses token router)
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/{tokenAddress}/holder
 *
 * @param input - Request parameters containing token address and holder address
 * @param context - Request context with TheGraph client and token from middleware
 * @returns Promise<TokenHolderResponse> - Holder balance info or null
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get specific holder's balance
 * const result = await orpc.token.holder.query({
 *   tokenAddress: '0x1234567890abcdef...',
 *   holderAddress: '0xabcdefabcdefabcd...'
 * });
 *
 * if (result.holder) {
 *   console.log(`Available: ${result.holder.available}`);
 *   console.log(`Total: ${result.holder.value}`);
 * } else {
 *   console.log('Address is not a holder of this token');
 * }
 * ```
 */
export const holder = tokenRouter.token.holder.handler(
  async ({ input, context }) => {
    const response = await context.theGraphClient.query(TOKEN_HOLDER_QUERY, {
      input: {
        tokenId: context.token.id.toLowerCase(),
        holderAddress: input.holderAddress.toLowerCase(),
      },
      output: z.object({
        token: z
          .object({
            balances: z.array(assetBalance()),
          })
          .nullable(),
      }),
    });

    // Extract the first (and should be only) balance entry
    const balance = response.token?.balances?.[0] ?? null;

    return {
      holder: balance,
    };
  }
);
