import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

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
    isin
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
 * @property {string} id - The stablecoin contract address
 * @property {string} name - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin
 * @property {number} decimals - The number of decimal places for the stablecoin
 * @property {string} totalSupply - The formatted total supply of the stablecoin
 * @property {bigint} totalSupplyExact - The exact total supply in base units
 * @property {string} collateral - The formatted collateral amount
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {number} lastCollateralUpdate - Timestamp of the last collateral update
 * @property {number} liveness - Liveness status of the stablecoin
 * @property {boolean} paused - Whether the stablecoin is paused
 * @property {Object} creator - Information about the creator
 * @property {Array} holders - List of top holders by value
 */
export const StableCoinFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  totalSupply: z.bigDecimal(),
  totalSupplyExact: z.bigInt(),
  collateral: z.bigDecimal(),
  isin: z.isin().nullish(),
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
    private
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 * @property {string} id - The stablecoin contract address
 * @property {boolean} private - Whether the stablecoin is private
 */
export const OffchainStableCoinFragmentSchema = z.object({
  id: z.address(),
  private: z.boolean(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainStableCoin = ZodInfer<
  typeof OffchainStableCoinFragmentSchema
>;
