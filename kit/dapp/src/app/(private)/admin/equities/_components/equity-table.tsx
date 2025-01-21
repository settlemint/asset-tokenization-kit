import { DataTable } from '@/components/blocks/data-table/data-table';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { columns } from './equity-table-columns';
import { icons } from './equity-table-icons';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);
export type Equity = FragmentOf<typeof EquityFragment>;

const Equities = theGraphGraphqlStarterkits(
  `
  query Equities {
    equities {
      ...EquityFields
    }
  }
`,
  [EquityFragment]
);

export async function EquityTable() {
  const { equities } = await theGraphClientStarterkits.request(Equities);

  return <DataTable columns={columns} data={equities} icons={icons} name="equities" />;
}
