import { PermissionFragment } from "@/lib/queries/asset/asset-users-fragment";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import type { AssetBalance } from "./asset-balance-schema";

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
      ... on Deposit {
        paused
      }
    }
  }
`,
  [PermissionFragment]
);

// Re-export the type
export type { AssetBalance };
