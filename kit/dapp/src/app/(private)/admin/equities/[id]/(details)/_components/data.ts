'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const EquityDetails = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
     id
    name
    symbol
    decimals
    totalSupply
    }
  }
`
);

export async function getEquity(id: string) {
  const data = await theGraphClientStarterkits.request(EquityDetails, { id });
  if (!data.equity) {
    throw new Error('Equity not found');
  }
  return data.equity;
}
