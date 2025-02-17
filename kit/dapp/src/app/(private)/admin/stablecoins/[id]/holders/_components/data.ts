import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
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
  query Holders($asset: String!) {
    assetBalances(where: {asset: $asset}) {
      ...HolderFragment
    }
  }
`,
  [HolderFragment]
);

export async function getHolders(id: string) {
  const data = await theGraphClientStarterkits.request(HoldersQuery, { asset: id });
  return data.assetBalances;
}

export type Holder = FragmentOf<typeof HolderFragment>;
