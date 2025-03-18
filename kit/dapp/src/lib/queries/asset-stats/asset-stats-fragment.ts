import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { type ZodInfer, z } from "@/lib/utils/zod";

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
 * Zod schema for validating asset statistics data
 *
 */
export const AssetStatsFragmentSchema = z.object({
  totalBurned: z.bigDecimal(),
  totalCollateral: z.bigDecimal(),
  totalFrozen: z.bigDecimal(),
  totalLocked: z.bigDecimal(),
  totalMinted: z.bigDecimal(),
  totalSupply: z.bigDecimal(),
  totalTransfers: z.bigDecimal(),
  totalUnfrozen: z.bigDecimal(),
  totalVolume: z.bigDecimal(),
  timestamp: z.timestamp(),
});

/**
 * Type definition for asset statistics data
 */
export type AssetStats = ZodInfer<typeof AssetStatsFragmentSchema>;
