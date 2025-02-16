import { getAuthenticatedUser } from '@/lib/auth/auth';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const FundTitle = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!, $account: Bytes!) {
    fund(id: $id) {
      id
      name
      symbol
      decimals
      paused
      holders(where: {account_: {id: $account}}) {
        value
      }
    }
  }
`
);

const OffchainFund = hasuraGraphql(`
  query OffchainFund($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export async function getFundTitle(id: string) {
  const normalizedId = getAddress(id);
  const user = await getAuthenticatedUser();
  const [data, dbFund] = await Promise.all([
    theGraphClientStarterkits.request(FundTitle, { id, account: user.wallet }),
    hasuraClient.request(OffchainFund, { id: normalizedId }),
  ]);

  if (!data.fund) {
    throw new Error('Fund not found');
  }

  return {
    ...data.fund,
    ...(dbFund.asset[0]
      ? dbFund.asset[0]
      : {
          private: false,
        }),
  };
}
