import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const AssetFragment = theGraphGraphqlStarterkits(`
  fragment AssetFragment on Asset {
    id
    name
    symbol
    type
  }
`);
export type Asset = FragmentOf<typeof AssetFragment>;
