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
 * @property {bigint} totalBurned - Total amount of tokens that have been burned
 * @property {bigint} totalCollateral - Total collateral value backing the asset
 * @property {bigint} totalFrozen - Total amount of tokens currently frozen
 * @property {bigint} totalLocked - Total amount of tokens currently locked
 * @property {bigint} totalMinted - Total amount of tokens that have been minted
 * @property {bigint} totalSupply - Current total supply of the asset
 * @property {bigint} totalTransfers - Total number of transfer transactions
 * @property {bigint} totalUnfrozen - Total amount of tokens that have been unfrozen
 * @property {bigint} totalVolume - Total trading volume of the asset
 * @property {bigint} timestamp - Unix timestamp when these statistics were recorded
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
