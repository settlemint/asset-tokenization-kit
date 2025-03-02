import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * GraphQL fragment for asset balance data from The Graph
 *
 * @remarks
 * Contains information about an account's balance for a specific asset,
 * including blocked and frozen status
 */
export const AssetBalanceFragment = theGraphGraphqlStarterkits(`
  fragment AssetBalanceFragment on AssetBalance {
    blocked
    frozen
    value
    account {
      id
      lastActivity
    }
    asset {
      id
      symbol
      decimals
    }
  }
`);

/**
 * Zod schema for validating asset balance data
 *
 */
export const AssetBalanceFragmentSchema = z.object({
  blocked: z.boolean(),
  frozen: z.bigDecimal(),
  value: z.bigDecimal(),
  account: z.object({
    id: z.address(),
    lastActivity: z.timestamp(),
  }),
  asset: z.object({
    id: z.address(),
    symbol: z.symbol(),
    decimals: z.number(),
  }),
});

/**
 * Type definition for asset balance data
 */
export type AssetBalance = ZodInfer<typeof AssetBalanceFragmentSchema>;
