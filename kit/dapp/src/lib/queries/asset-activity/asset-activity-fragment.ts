import { theGraphGraphqlKit } from '@/lib/settlemint/the-graph';
import { type ZodInfer, z } from '@/lib/utils/zod';

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

/**
 * Zod schema for validating asset activity data
 *
 */
export const AssetActivityFragmentSchema = z.object({
  id: z.string(),
  assetType: z.assetType(),
  totalSupply: z.bigDecimal(),
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
