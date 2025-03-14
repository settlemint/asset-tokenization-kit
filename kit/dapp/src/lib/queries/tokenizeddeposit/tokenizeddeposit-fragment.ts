import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const TokenizedDepositFragment = theGraphGraphqlKit(`
  fragment TokenizedDepositFragment on TokenizedDeposit {
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
  }
`);

/**
 * Zod schema for validating on-chain stablecoin data
 *
 */
export const TokenizedDepositFragmentSchema = z.object({
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
});

/**
 * Type definition for on-chain stablecoin data
 */
export type TokenizedDeposit = ZodInfer<typeof TokenizedDepositFragmentSchema>;

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainTokenizedDepositFragment = hasuraGraphql(`
  fragment OffchainTokenizedDepositFragment on asset {
    id
    isin
  }
`);

/**
 * Zod schema for validating off-chain stablecoin data
 *
 */
export const OffchainTokenizedDepositFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
});

/**
 * Type definition for off-chain stablecoin data
 */
export type OffchainTokenizedDeposit = ZodInfer<
  typeof OffchainTokenizedDepositFragmentSchema
>;
