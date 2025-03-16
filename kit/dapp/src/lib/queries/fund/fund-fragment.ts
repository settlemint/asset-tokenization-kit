import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlKit } from '@/lib/settlemint/the-graph';
import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const FundFragment = theGraphGraphqlKit(`
  fragment FundFragment on Fund {
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
    fundCategory
    fundClass
    managementFeeBps
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
    asAccount {
      balances {
        value
      }
    }
  }
`);

/**
 * Zod schema for validating on-chain stablecoin data
 *
 */
export const FundFragmentSchema = z.object({
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
  fundCategory: z.fundCategory(),
  fundClass: z.fundClass(),
  managementFeeBps: z.number(),
  creator: z.object({
    id: z.address(),
  }),
  holders: z.array(
    z.object({
      valueExact: z.bigInt(),
    })
  ),
  asAccount: z.object({
    balances: z.array(
      z.object({
        value: z.bigDecimal(),
      })
    ),
  }),
});

/**
 * Type definition for on-chain stablecoin data
 */
export type Fund = ZodInfer<typeof FundFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainFundFragment = hasuraGraphql(`
  fragment OffchainFundFragment on asset {
    id
    isin
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainFundFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainFund = ZodInfer<typeof OffchainFundFragmentSchema>;
