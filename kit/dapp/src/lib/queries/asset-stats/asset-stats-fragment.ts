import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for asset statistics data from The Graph
 *
 * @remarks
 * Contains comprehensive statistics about an asset's activity and supply metrics
 */
export const AssetStatsFragment = theGraphGraphqlStarterkits(`
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
  totalBurned: z.bigInt(),
  totalCollateral: z.bigInt(),
  totalFrozen: z.bigInt(),
  totalLocked: z.bigInt(),
  totalMinted: z.bigInt(),
  totalSupply: z.bigInt(),
  totalTransfers: z.bigInt(),
  totalUnfrozen: z.bigInt(),
  totalVolume: z.bigInt(),
  timestamp: z.timestamp(),
});

/**
 * Type definition for asset statistics data
 */
export type AssetStats = ZodInfer<typeof AssetStatsFragmentSchema>;
