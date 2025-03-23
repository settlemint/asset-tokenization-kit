import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import type { AssetActivity } from "./asset-activity-schema";

/**
 * GraphQL fragment for asset activity data from The Graph
 *
 * @remarks
 * Contains aggregated event counts for different types of asset activities
 */
export const AssetActivityFragment = theGraphGraphqlKit(`
  fragment AssetActivityFragment on AssetActivityData {
    id
    assetType
    totalSupply
    burnEventCount
    mintEventCount
    transferEventCount
    frozenEventCount
    unfrozenEventCount
  }
`);

// Re-export the type
export type { AssetActivity };
