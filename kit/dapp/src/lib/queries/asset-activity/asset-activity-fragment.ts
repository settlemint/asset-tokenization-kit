import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for asset activity data from The Graph
 *
 * @remarks
 * Contains aggregated event counts for different types of asset activities
 */
export const AssetActivityFragment = theGraphGraphqlStarterkits(`
  fragment AssetActivityFragment on AssetActivityData {
    id
    assetType
    burnEventCount
    mintEventCount
    transferEventCount
    frozenEventCount
    unfrozenEventCount
  }
`);

/**
 * Zod schema for validating asset activity data
 *
 * @property {string} id - Unique identifier for the asset activity
 * @property {string} assetType - The type of asset (e.g., ERC20, ERC721)
 * @property {bigint} burnEventCount - Number of burn events for this asset
 * @property {bigint} mintEventCount - Number of mint events for this asset
 * @property {bigint} transferEventCount - Number of transfer events for this asset
 * @property {bigint} frozenEventCount - Number of token freezing events for this asset
 * @property {bigint} unfrozenEventCount - Number of token unfreezing events for this asset
 */
export const AssetActivityFragmentSchema = z.object({
  id: z.string(),
  assetType: z.string(),
  burnEventCount: z.bigInt(),
  mintEventCount: z.bigInt(),
  transferEventCount: z.bigInt(),
  frozenEventCount: z.bigInt(),
  unfrozenEventCount: z.bigInt(),
});

/**
 * Type definition for asset activity data
 */
export type AssetActivity = ZodInfer<typeof AssetActivityFragmentSchema>;
