import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const HolderFragment = theGraphGraphqlStarterkits(`
  fragment HolderFragment on AssetBalance {
    blocked
    frozen
    value
    id
    account {
      id
      lastActivity
    }
  }
`);

const HoldersQuery = theGraphGraphqlStarterkits(
  `
  query Holders($asset: String!, $first: Int, $skip: Int) {
    assetBalances(where: {asset: $asset}, first: $first, skip: $skip) {
      ...HolderFragment
    }
  }
`,
  [HolderFragment]
);

export function getHolders(id: string) {
  return fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(HoldersQuery, { asset: id, first, skip });
    return result.assetBalances;
  });
}

export type Holder = FragmentOf<typeof HolderFragment>;
