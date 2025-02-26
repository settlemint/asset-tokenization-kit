import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFragment on Equity {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    isin
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
export const EquityFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  totalSupply: z.bigDecimal(),
  totalSupplyExact: z.bigInt(),
  isin: z.isin().nullish(),
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
export type Equity = ZodInfer<typeof EquityFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainEquityFragment = hasuraGraphql(`
  fragment OffchainEquityFragment on asset {
    id
    private
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainEquityFragmentSchema = z.object({
  id: z.address(),
  private: z.boolean(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainEquity = ZodInfer<typeof OffchainEquityFragmentSchema>;
