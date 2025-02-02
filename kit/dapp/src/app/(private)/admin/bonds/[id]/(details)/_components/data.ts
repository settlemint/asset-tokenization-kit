'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const BondDetails = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!) {
    bond(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    underlyingAsset
    redeemedAmount
    paused
    }
  }
`
);

export async function getBond(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(BondDetails, { id });
      if (!data.bond) {
        throw new Error('Bond not found');
      }
      return data.bond;
    },
    [TokenType.Bond, id, 'details'],
    {
      revalidate: 60,
      tags: [TokenType.Bond, `${TokenType.Bond}:${id}`, `${TokenType.Bond}:${id}:details`],
    }
  )();
}
