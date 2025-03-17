import {
  PermissionFragment,
  PermissionFragmentSchema,
} from '@/lib/queries/asset/asset-fragment';
import { theGraphGraphqlKit } from '@/lib/settlemint/the-graph';
import { type ZodInfer, z } from '@/lib/utils/zod';

/**
 * GraphQL fragment for asset balance data from The Graph
 *
 * @remarks
 * Contains information about an account's balance for a specific asset,
 * including blocked and frozen status
 */
export const AssetBalanceFragment = theGraphGraphqlKit(
  `
  fragment AssetBalanceFragment on AssetBalance {
    blocked
    frozen
    lastActivity
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
      creator { id }
      admins { ...PermissionFragment }
      supplyManagers { ...PermissionFragment }
      userManagers { ...PermissionFragment }
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
      ... on TokenizedDeposit {
        paused
      }
    }
  }
`,
  [PermissionFragment]
);

/**
 * Zod schema for validating asset balance data
 *
 */
export const AssetBalanceFragmentSchema = z.object({
  blocked: z.boolean(),
  frozen: z.bigDecimal(),
  value: z.bigDecimal(),
  lastActivity: z.timestamp(),
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
    creator: z.object({ id: z.address() }),
    admins: z.array(PermissionFragmentSchema),
    supplyManagers: z.array(PermissionFragmentSchema),
    userManagers: z.array(PermissionFragmentSchema),
    paused: z.boolean().optional().default(false),
  }),
});

/**
 * Type definition for asset balance data
 */
export type AssetBalance = ZodInfer<typeof AssetBalanceFragmentSchema>;
