import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { type ZodInfer, z } from "@/lib/utils/zod";

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
  assetType: z.string(),
  totalSupply: z.string().transform((val) => {
    // Remove decimal point and convert to bigint
    const [whole = '0', decimal = ''] = val.split('.');
    const paddedDecimal = decimal.padEnd(18, '0'); // Pad with zeros to handle 18 decimals
    return BigInt(whole + paddedDecimal);
  }),
  burnEventCount: z.number(),
  mintEventCount: z.number(),
  transferEventCount: z.number(),
  frozenEventCount: z.number(),
  unfrozenEventCount: z.number(),
});

/**
 * Type definition for asset activity data
 */
export type AssetActivity = ZodInfer<typeof AssetActivityFragmentSchema>;
