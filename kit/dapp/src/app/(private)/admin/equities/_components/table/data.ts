'use server';

import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { inArray } from 'drizzle-orm';
import { getAddress } from 'viem';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
    decimals
    totalSupply
    equityCategory
    equityClass
    paused
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

export type EquityAsset = FragmentOf<typeof EquityFragment> & BaseAsset;

export async function getEquities() {
  const data = await theGraphClientStarterkits.request(Equities);
  const theGraphEquities = data.equities;

  const equityAddresses = theGraphEquities.map((equity) => equity.id);
  const dbEquities = await db
    .select()
    .from(asset)
    .where(inArray(asset.id, equityAddresses.map(getAddress)));

  const equities = theGraphEquities.map((equity) => {
    const dbEquity = dbEquities.find((e) => e.id === getAddress(equity.id));
    return {
      ...equity,
      ...(dbEquity
        ? dbEquity
        : {
            private: false,
            organizationId: '',
          }),
    };
  });

  return equities;
}
