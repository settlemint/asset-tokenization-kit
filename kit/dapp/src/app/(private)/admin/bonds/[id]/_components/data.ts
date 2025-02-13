import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const BondTitle = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!) {
    bond(id: $id) {
      id
      name
      symbol
      paused
    }
  }
`
);

const OffchainBond = hasuraGraphql(`
  query OffchainBond($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export async function getBondTitle(id: string) {
  const normalizedId = getAddress(id);
  const [data, dbBond] = await Promise.all([
    theGraphClientStarterkits.request(BondTitle, { id }),
    hasuraClient.request(OffchainBond, { id: normalizedId }),
  ]);

  if (!data.bond) {
    throw new Error('Bond not found');
  }

  return {
    ...data.bond,
    ...(dbBond.asset[0]
      ? dbBond.asset[0]
      : {
          private: false,
        }),
  };
}
