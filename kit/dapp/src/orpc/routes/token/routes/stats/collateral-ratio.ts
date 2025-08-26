import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch token collateral data from identity claims
 * Retrieves collateral claims directly from the token's identity contract
 */
const TOKEN_COLLATERAL_QUERY = theGraphGraphql(`
  query TokenCollateral($tokenId: ID!) {
    token(id: $tokenId) {
      id
      totalSupply
      totalSupplyExact
      decimals
      account {
        identity {
          id
          claims(where: { name: "collateral", revoked: false }) {
            id
            name
            revoked
            values {
              key
              value
            }
          }
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const TokenCollateralResponseSchema = z.object({
  token: z
    .object({
      id: z.string(),
      totalSupply: z.number(),
      totalSupplyExact: z.string(),
      decimals: z.number(),
      account: z.object({
        identity: z
          .object({
            id: z.string(),
            claims: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                revoked: z.boolean(),
                values: z.array(
                  z.object({
                    key: z.string(),
                    value: z.string(),
                  })
                ),
              })
            ),
          })
          .nullable(),
      }),
    })
    .nullable(),
});

/**
 * Collateral ratio statistics route handler.
 *
 * Fetches collateral ratio data for stablecoins and tokenized deposits,
 * showing the breakdown between available and used collateral.
 * The collateral ratio indicates how much of the total collateral
 * is currently backing issued tokens.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/collateral-ratio
 *
 * @param input.tokenAddress - The token contract address to query
 * @returns Promise<StatsCollateralRatioOutput> - Collateral buckets and ratios
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get collateral ratio for a stablecoin
 * const collateralData = await orpc.token.statsCollateralRatio.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(collateralData.buckets);
 * console.log(`Collateral ratio: ${collateralData.collateralRatio}%`);
 * ```
 */
export const statsCollateralRatio =
  tokenRouter.token.statsCollateralRatio.handler(async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware

    // Fetch token data with collateral claims from identity
    const response = await context.theGraphClient.query(
      TOKEN_COLLATERAL_QUERY,
      {
        input: {
          tokenId: input.tokenAddress.toLowerCase(),
        },
        output: TokenCollateralResponseSchema,
      }
    );

    const token = response.token;

    // Handle case where token doesn't exist
    if (!token) {
      return {
        buckets: [
          { name: "collateralAvailable", value: 0 },
          { name: "collateralUsed", value: 0 },
        ],
        totalCollateral: 0,
        collateralRatio: 0,
      };
    }

    // Handle case where token has no identity or no collateral claims
    if (!token.account.identity || token.account.identity.claims.length === 0) {
      return {
        buckets: [
          { name: "collateralAvailable", value: 0 },
          { name: "collateralUsed", value: 0 },
        ],
        totalCollateral: 0,
        collateralRatio: 0,
      };
    }

    // Get the latest (most recent) collateral claim
    const collateralClaim = token.account.identity.claims[0];
    if (!collateralClaim) {
      return {
        buckets: [
          { name: "collateralAvailable", value: 0 },
          { name: "collateralUsed", value: 0 },
        ],
        totalCollateral: 0,
        collateralRatio: 0,
      };
    }

    // Extract amount from claim values
    const amountValue = collateralClaim.values.find((v) => v.key === "amount");
    if (!amountValue) {
      return {
        buckets: [
          { name: "collateralAvailable", value: 0 },
          { name: "collateralUsed", value: 0 },
        ],
        totalCollateral: 0,
        collateralRatio: 0,
      };
    }

    // Parse collateral amount (from wei to human-readable)
    const collateralAmountWei = BigInt(amountValue.value);
    const decimals = token.decimals;
    const divisor = BigInt(10) ** BigInt(decimals);
    const totalCollateral = Number(collateralAmountWei / divisor);

    // Parse total supply (current tokens in circulation)
    const totalSupplyWei = BigInt(token.totalSupplyExact);
    const collateralUsed = Number(totalSupplyWei / divisor);

    // Calculate available collateral
    const collateralAvailable = totalCollateral - collateralUsed;

    // Build collateral buckets
    const buckets = [
      { name: "collateralAvailable", value: Math.max(0, collateralAvailable) },
      { name: "collateralUsed", value: collateralUsed },
    ];

    // Calculate collateral ratio (used/total * 100)
    const collateralRatio =
      totalCollateral > 0 ? (collateralUsed / totalCollateral) * 100 : 0;

    return {
      buckets,
      totalCollateral,
      collateralRatio,
    };
  });
