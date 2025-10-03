import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { DenominationAssetsResponseSchema } from "@/orpc/routes/token/routes/token.denomination-assets.schema";

/**
 * GraphQL query to fetch tokens that have bonds using the specified token as their denomination asset
 */
const DENOMINATION_ASSETS_QUERY = theGraphGraphql(`
  query DenominationAssets($tokenId: Bytes!) {
    tokens(
        where: { denominationAssetForBond_: { id: $tokenId } }
      ) @fetchAll {
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
        tokenFactory {
          id
        }
      }
    }
  `);

/**
 * Retrieves all bonds that use the specified token as their denomination asset
 */
export const denominationAssets = tokenRouter.token.denominationAssets.handler(
  async ({ context }) => {
    const response = await context.theGraphClient.query(
      DENOMINATION_ASSETS_QUERY,
      {
        input: {
          tokenId: context.token.id.toLowerCase(),
        },
        output: DenominationAssetsResponseSchema,
      }
    );
    return response.tokens;
  }
);
