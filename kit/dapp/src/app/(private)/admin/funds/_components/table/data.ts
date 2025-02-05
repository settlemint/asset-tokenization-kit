'use server';

import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { inArray } from 'drizzle-orm';
import { getAddress } from 'viem';

const FundFragment = theGraphGraphqlStarterkits(`
  fragment FundFields on Fund {
    id
    name
    symbol
    decimals
    totalSupply
    fundCategory
    fundClass
    paused
  }
`);

const Funds = theGraphGraphqlStarterkits(
  `
  query Funds {
    funds {
      ...FundFields
    }
  }
`,
  [FundFragment]
);

export type FundAsset = FragmentOf<typeof FundFragment> & BaseAsset;

export async function getFunds() {
  const data = await theGraphClientStarterkits.request(Funds);
  const theGraphFunds = data.funds;

  const fundAddresses = theGraphFunds.map((fund) => fund.id);
  const dbFunds = await db
    .select()
    .from(asset)
    .where(inArray(asset.id, fundAddresses.map(getAddress)));

  const funds = theGraphFunds.map((fund) => {
    const dbFund = dbFunds.find((f) => f.id === getAddress(fund.id));
    return {
      ...fund,
      ...(dbFund
        ? dbFund
        : {
            private: false,
          }),
    };
  });

  return funds;
}
