import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

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
  const data = await theGraphClientStarterkits.request(BondDetails, { id });
  if (!data.bond) {
    throw new Error('Bond not found');
  }
  return data.bond;
}
