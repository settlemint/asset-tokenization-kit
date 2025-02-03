'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const BondTitle = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!) {
    bond(id: $id) {
    id
    name
    symbol
    }
  }
`
);

export async function getBondTitle(id: string) {
  const data = await theGraphClientStarterkits.request(BondTitle, { id });
  if (!data.bond) {
    throw new Error('Bond not found');
  }
  return data.bond;
}
