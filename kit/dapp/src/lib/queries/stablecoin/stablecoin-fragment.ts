import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFragment on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    collateral
    collateralRatio
    lastCollateralUpdate
    liveness
    paused
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
  }
`);

/**
 * Zod schema for validating on-chain stablecoin data
 *
 */
export const StableCoinFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  totalSupply: z.bigDecimal(),
  totalSupplyExact: z.bigInt(),
  collateral: z.bigDecimal(),
  collateralRatio: z.bigDecimal(),
  lastCollateralUpdate: z.timestamp(),
  liveness: z.coerce.number(),
  paused: z.boolean(),
  creator: z.object({
    id: z.address(),
  }),
  holders: z.array(
    z.object({
      valueExact: z.bigInt(),
    })
  ),
});

/**
 * Type definition for on-chain stablecoin data
 */
export type StableCoin = ZodInfer<typeof StableCoinFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainStableCoinFragment = hasuraGraphql(`
  fragment OffchainStableCoinFragment on asset {
    id
    isin
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainStableCoinFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainStableCoin = ZodInfer<
  typeof OffchainStableCoinFragmentSchema
>;
