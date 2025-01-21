import { DataTable } from '@/components/blocks/data-table/data-table';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { columns } from './bond-table-columns';
import { icons } from './bond-table-icons';

const BondFragment = theGraphGraphqlStarterkits(`
  fragment BondFields on Bond {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);
export type Bond = FragmentOf<typeof BondFragment>;

const Bonds = theGraphGraphqlStarterkits(
  `
  query Bonds {
    bonds {
      ...BondFields
    }
  }
`,
  [BondFragment]
);

export async function BondTable() {
  const { bonds } = await theGraphClientStarterkits.request(Bonds);

  return <DataTable columns={columns} data={bonds} icons={icons} name="bonds" />;
}
