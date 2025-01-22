import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { defaultAssetTableColumns } from '@/components/blocks/asset-table/asset-table-columns';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

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

async function getEquities() {
  'use server';
  const data = await theGraphClientStarterkits.request(Equities);
  return data.equities;
}

export default function EquityPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Equities</h2>
      </div>
      <AssetTable type="equities" dataAction={getEquities} columns={defaultAssetTableColumns('equities')} />
    </>
  );
}
