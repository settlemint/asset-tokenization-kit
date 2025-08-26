import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch token collateral data from identity claims
 * Retrieves collateral claims from the token's identity contract and related identities
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
    # Also query all collateral claims to catch cases where claims are on issuer identities
    allCollateralClaims: identityClaims(
      where: { name: "collateral", revoked: false }
      orderBy: deployedInTransaction
      orderDirection: desc
    ) {
      id
      name
      revoked
      identity {
        id
      }
      values {
        key
        value
      }
      deployedInTransaction
    }
  }
`);

// Schema for the GraphQL response
const TokenCollateralResponseSchema = z.object({
  token: z
    .object({
      id: z.string(),
      totalSupply: z.string(),
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
  allCollateralClaims: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      revoked: z.boolean(),
      identity: z.object({
        id: z.string(),
      }),
      values: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
      deployedInTransaction: z.string(),
    })
  ),
});

/**
 * Helper function to return zero collateral state
 * Used when no valid collateral data is available
 */
const getZeroCollateralState = () => ({
  buckets: [
    { name: "collateralAvailable", value: 0 },
    { name: "collateralUsed", value: 0 },
  ],
  totalCollateral: 0,
  collateralRatio: 0,
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
      return getZeroCollateralState();
    }

    // Try to get collateral claim from token's own identity first
    let collateralClaim = token.account.identity?.claims?.[0];

    // If no claims on token's identity, look for claims from the fallback collection
    // This handles cases where collateral was added to issuer identities instead of token identity
    if (!collateralClaim && response.allCollateralClaims.length > 0) {
      // For now, we'll use the most recent collateral claim as fallback
      // TODO: In the future, add validation to ensure the claim is related to this token
      // by checking issuer relationships or token ownership
      const fallbackClaim = response.allCollateralClaims[0]; // Already ordered by deployedInTransaction desc
      if (!fallbackClaim) {
        return getZeroCollateralState();
      }
      collateralClaim = {
        id: fallbackClaim.id,
        name: fallbackClaim.name,
        revoked: fallbackClaim.revoked,
        values: fallbackClaim.values,
      };

      // Log fallback usage for monitoring and debugging
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `Using fallback collateral claim for token ${token.id}. ` +
            `Claim from identity ${fallbackClaim.identity.id} instead of token's identity ${token.account.identity?.id || "none"}.`
        );
      }
    }

    // Handle case where no collateral claims exist anywhere
    if (!collateralClaim) {
      return getZeroCollateralState();
    }

    // Extract amount from claim values with better error handling
    const amountValue = collateralClaim.values.find((v) => v.key === "amount");
    if (!amountValue) {
      // Log data quality issue for debugging
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `Malformed collateral claim for token ${token.id}: missing 'amount' field. ` +
            `Available keys: ${collateralClaim.values.map((v) => v.key).join(", ")}`
        );
      }
      return getZeroCollateralState();
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
