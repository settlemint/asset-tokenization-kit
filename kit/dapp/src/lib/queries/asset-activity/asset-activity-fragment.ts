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
    totalSupply
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
 */
export const AssetActivityFragmentSchema = z.object({
  id: z.string(),
  assetType: z.assetType(),
  totalSupply: z.coerce.number(),
  burnEventCount: z.coerce.number(),
  mintEventCount: z.coerce.number(),
  transferEventCount: z.coerce.number(),
  frozenEventCount: z.coerce.number(),
  unfrozenEventCount: z.coerce.number(),
});

/**
 * Type definition for asset activity data
 */
export type AssetActivity = ZodInfer<typeof AssetActivityFragmentSchema>;
