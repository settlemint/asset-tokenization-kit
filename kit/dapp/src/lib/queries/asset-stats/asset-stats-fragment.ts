import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import type { AssetStats } from "./asset-stats-schema";

/**
 * GraphQL fragment for asset statistics data from The Graph
 *
 * @remarks
 * Contains comprehensive statistics about an asset's activity and supply metrics
 */
export const AssetStatsFragment = theGraphGraphqlKit(`
  fragment AssetStatsFragment on AssetStats {
    totalBurned
    totalCollateral
    totalFrozen
    totalLocked
    totalMinted
    totalSupply
    totalTransfers
    totalUnfrozen
    totalVolume
    timestamp
  }
`);

/**
 * Reexport the AssetStats type
 */
export type { AssetStats };
