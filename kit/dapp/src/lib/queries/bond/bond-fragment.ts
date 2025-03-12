import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const BondFragment = theGraphGraphqlKit(`
  fragment BondFragment on Bond {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    totalBurned
    totalBurnedExact
    totalHolders
    paused
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
    underlyingAsset
    maturityDate
    isMatured
    hasSufficientUnderlying
  }
`);

/**
 * Zod schema for validating on-chain stablecoin data
 *
 */
export const BondFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  totalSupply: z.bigDecimal(),
  totalSupplyExact: z.bigInt(),
  totalBurned: z.bigDecimal(),
  totalBurnedExact: z.bigInt(),
  totalHolders: z.number(),
  paused: z.boolean(),
  creator: z.object({
    id: z.address(),
  }),
  holders: z.array(
    z.object({
      valueExact: z.bigInt(),
    })
  ),
  underlyingAsset: z.address(),
  maturityDate: z.bigInt().optional(),
  isMatured: z.boolean(),
  hasSufficientUnderlying: z.boolean(),
});

/**
 * Type definition for on-chain stablecoin data
 */
export type Bond = ZodInfer<typeof BondFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainBondFragment = hasuraGraphql(`
  fragment OffchainBondFragment on asset {
    id
    isin
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainBondFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainBond = ZodInfer<typeof OffchainBondFragmentSchema>;
