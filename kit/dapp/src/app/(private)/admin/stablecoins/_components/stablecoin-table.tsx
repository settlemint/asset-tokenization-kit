import { DataTable } from '@/components/blocks/data-table/data-table';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { columns } from './stablecoin-table-columns';
import { icons } from './stablecoin-table-icons';

const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);
export type StableCoin = FragmentOf<typeof StableCoinFragment>;

const StableCoins = theGraphGraphqlStarterkits(
  `
  query StableCoins {
    stableCoins {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

export async function StableCoinTable() {
  const { stableCoins } = await theGraphClientStarterkits.request(StableCoins);

  return <DataTable columns={columns} data={stableCoins} icons={icons} name="stablecoins" />;
}
