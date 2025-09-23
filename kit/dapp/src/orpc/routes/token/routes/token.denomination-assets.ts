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
      denominationAssetForBond: z.array(
        z.object({
          id: z.string(),
          faceValue: z.string(),
          maturityDate: z.string(),
          isMatured: z.boolean(),
          denominationAssetNeeded: z.string(),
        })
      ),
    })
    .nullable(),
});

/**
 * GraphQL query to fetch bonds that use a specific token as denomination asset
 */
const DENOMINATION_ASSETS_QUERY = theGraphGraphql(`
  query DenominationAssets($tokenAddress: ID!) {
    token(id: $tokenAddress) {
      denominationAssetForBond {
        id
        faceValue
        maturityDate
        isMatured
        denominationAssetNeeded
      }
    }
  }
`);

/**
 * Secondary query to fetch token details for a list of token IDs
 */
const TOKENS_BY_IDS_QUERY = theGraphGraphql(`
  query TokensByIds($ids: [Bytes!]!) {
    tokens(where: { id_in: $ids }) {
      id
      name
      symbol
      decimals
      totalSupply
      pausable { paused }
      factory: tokenFactory { id name }
    }
  }
`);

const MinimalTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  totalSupply: z.string(),
  pausable: z.object({ paused: z.boolean() }),
  factory: z.object({ id: z.string(), name: z.string() }),
});

const TokensByIdsResponseSchema = z.object({
  tokens: z.array(MinimalTokenSchema),
});

/**
 * Retrieves all bonds that use the specified token as their denomination asset
 */
export const denominationAssets = tokenRouter.token.denominationAssets.handler(
  async ({ context, errors }) => {
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

    const bonds = token.denominationAssetForBond || [];
    if (bonds.length === 0) return [];

    const bondIds = bonds.map((b) => b.id.toLowerCase());
    const tokensResp = await context.theGraphClient.query(TOKENS_BY_IDS_QUERY, {
      input: { ids: bondIds },
      output: TokensByIdsResponseSchema,
    });

    const tokenMap = new Map(
      tokensResp.tokens.map((t) => [t.id.toLowerCase(), t])
    );

    const merged = bonds.map((b) => {
      const tokenDetails = tokenMap.get(b.id.toLowerCase());
      if (!tokenDetails) {
        throw errors.NOT_FOUND({ message: "Token details not found for bond" });
      }
      const result = {
        ...b,
        token: tokenDetails,
      };
      return DenominationAssetBondSchema.parse(result);
    });

    return merged;
  }
);
