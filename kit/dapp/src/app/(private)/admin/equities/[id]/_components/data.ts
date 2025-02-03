'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const EquityTitle = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
    id
    name
    symbol    }
  }
`
);

export async function getEquityTitle(id: string) {
  const data = await theGraphClientStarterkits.request(EquityTitle, { id });
  if (!data.equity) {
    throw new Error('Equity not found');
  }
  return data.equity;
}
