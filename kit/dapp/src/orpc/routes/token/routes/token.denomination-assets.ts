import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * Schema for denomination asset bond data
 */
const DenominationAssetBondSchema = z.object({
  id: z.string(),
  token: z.object({
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    totalSupply: z.string(),
    pausable: z.object({
      paused: z.boolean(),
    }),
    factory: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  faceValue: z.string(),
  maturityDate: z.string(),
  isMatured: z.boolean(),
  denominationAssetNeeded: z.string(),
});

/**
 * Schema for the complete denomination assets response
 */
const DenominationAssetsResponseSchema = z.object({
  token: z
    .object({
      denominationAssetForBond: z.array(DenominationAssetBondSchema),
    })
    .nullable(),
});

/**
 * GraphQL query to fetch bonds that use a specific token as denomination asset
 */
const DENOMINATION_ASSETS_QUERY = theGraphGraphql(`
  query DenominationAssets($tokenAddress: String!) {
    token(id: $tokenAddress) {
      denominationAssetForBond {
        id
        token {
          id
          name
          symbol
          decimals
          totalSupply
          pausable {
            paused
          }
          factory {
            id
            name
          }
        }
        faceValue
        maturityDate
        isMatured
        denominationAssetNeeded
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
          tokenAddress: context.token.id.toLowerCase(),
        },
        output: DenominationAssetsResponseSchema,
      }
    );

    const token = response.token;
    if (!token) {
      return [];
    }

    return token.denominationAssetForBond || [];
  }
);
