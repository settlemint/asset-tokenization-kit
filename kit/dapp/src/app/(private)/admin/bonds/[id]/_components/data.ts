import { getAuthenticatedUser } from '@/lib/auth/auth';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const BondTitle = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!, $account: Bytes!) {
    bond(id: $id) {
      id
      name
      symbol
      paused
      decimals
      holders(where: {account_: {id: $account}}) {
        value
      }
      underlyingAsset
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

export type Bond = Awaited<ReturnType<typeof getBond>>;

export async function getBond(id: string) {
  const normalizedId = getAddress(id);
  const user = await getAuthenticatedUser();
  const [data, dbBond] = await Promise.all([
    theGraphClientStarterkits.request(BondTitle, { id, account: user.wallet }),
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
