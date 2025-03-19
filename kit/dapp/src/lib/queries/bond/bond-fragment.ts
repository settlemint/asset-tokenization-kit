import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { type ZodInfer, z } from "@/lib/utils/zod";

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
    yieldSchedule {
      id
      startDate
      endDate
      rate
      interval
      totalClaimed
      totalClaimedExact
      unclaimedYield
      unclaimedYieldExact
      underlyingBalance
      underlyingBalanceExact
      periods {
        id
        periodId
        startDate
        endDate
        rate
        totalClaimed
        totalClaimedExact
      }
    }
    redeemedAmount
    faceValue
    underlyingBalance
    totalUnderlyingNeeded
    totalUnderlyingNeededExact
    cap
    deployedOn
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
  yieldSchedule: z.object({
    id: z.address(),
    startDate: z.bigInt(),
    endDate: z.bigInt(),
    rate: z.bigInt(),
    interval: z.bigInt(),
    totalClaimed: z.bigDecimal(),
    totalClaimedExact: z.bigInt(),
    unclaimedYield: z.bigDecimal(),
    unclaimedYieldExact: z.bigInt(),
    underlyingBalance: z.bigDecimal(),
    underlyingBalanceExact: z.bigInt(),
    periods: z.array(
      z.object({
        id: z.string(),
        periodId: z.bigInt(),
        startDate: z.bigInt(),
        endDate: z.bigInt(),
        rate: z.bigInt(),
        totalClaimed: z.bigDecimal(),
        totalClaimedExact: z.bigInt(),
      })
    ),
  }).nullable(),
  redeemedAmount: z.bigInt(),
  faceValue: z.bigInt(),
  underlyingBalance: z.bigInt(),
  totalUnderlyingNeeded: z.bigDecimal(),
  totalUnderlyingNeededExact: z.bigInt(),
  cap: z.bigInt(),
  deployedOn: z.bigInt(),
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
    value_in_base_currency
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainBondFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
  value_in_base_currency: z.fiatCurrencyAmount(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainBond = ZodInfer<typeof OffchainBondFragmentSchema>;
