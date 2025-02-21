import { getAuthenticatedUser } from '@/lib/auth/auth';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const EquityTitle = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!, $account: Bytes!) {
    equity(id: $id) {
      id
      name
      symbol
      paused
      decimals
      holders(where: {account_: {id: $account}}) {
        value
      }
    }
  }
`
);

const OffchainEquity = hasuraGraphql(`
  query OffchainEquity($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export type Equity = Awaited<ReturnType<typeof getEquity>>;

export async function getEquity(id: string) {
  const normalizedId = getAddress(id);
  const user = await getAuthenticatedUser();
  const [data, dbEquity] = await Promise.all([
    theGraphClientStarterkits.request(EquityTitle, { id, account: user.wallet }),
    hasuraClient.request(OffchainEquity, { id: normalizedId }),
  ]);

  if (!data.equity) {
    throw new Error('Equity not found');
  }

  return {
    ...data.equity,
    ...(dbEquity.asset[0]
      ? dbEquity.asset[0]
      : {
          private: false,
        }),
  };
}
