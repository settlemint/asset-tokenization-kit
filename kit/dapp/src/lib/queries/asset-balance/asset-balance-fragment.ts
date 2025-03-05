import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { type ZodInfer, z } from "@/lib/utils/zod";

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
      name
      symbol
      decimals
      type
      ... on StableCoin {
        paused
      }
      ... on Bond {
        paused
      }
      ... on Fund {
        paused
      }
      ... on Equity {
        paused
      }
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
    name: z.string(),
    symbol: z.symbol(),
    decimals: z.number(),
    type: z.assetType(),
    paused: z.boolean().optional().default(false),
  }),
});

/**
 * Type definition for asset balance data
 */
export type AssetBalance = ZodInfer<typeof AssetBalanceFragmentSchema>;
