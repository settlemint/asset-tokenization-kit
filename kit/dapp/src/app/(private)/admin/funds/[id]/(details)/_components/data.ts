'use server';

import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { eq } from 'drizzle-orm';

const FundDetails = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    fundCategory
    fundClass
    paused
    }
  }
`
);

export async function getFund(id: string) {
  const data = await theGraphClientStarterkits.request(FundDetails, { id });
  if (!data.fund) {
    throw new Error('Fund not found');
  }
  const theGraphFund = data.fund;
  const dbFund = await db.select().from(asset).where(eq(asset.id, id)).limit(1);
  return {
    ...theGraphFund,
    ...(dbFund[0]
      ? dbFund[0]
      : {
          private: false,
        }),
  };
}
