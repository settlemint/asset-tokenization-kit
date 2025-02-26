import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const CryptoCurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyFragment on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
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
export const CryptoCurrencyFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  totalSupply: z.bigDecimal(),
  totalSupplyExact: z.bigInt(),
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
export type CryptoCurrency = ZodInfer<typeof CryptoCurrencyFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainCryptoCurrencyFragment = hasuraGraphql(`
  fragment OffchainCryptoCurrencyFragment on asset {
    id
    private
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainCryptoCurrencyFragmentSchema = z.object({
  id: z.address(),
  private: z.boolean(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainCryptoCurrency = ZodInfer<
  typeof OffchainCryptoCurrencyFragmentSchema
>;
