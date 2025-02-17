import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-hasura';

const UserFragment = hasuraGraphql(`
  fragment UserFields on user {
    name
    email
    id
    name
    role
    banned
    ban_reason
    ban_expires
    wallet
    created_at
    updated_at
    image
    kyc_verified
    last_login
  }
`);

const UserQuery = hasuraGraphql(
  `
  query User($id: String!) {
    user_by_pk(id: $id) {
      ...UserFields
    }
  }
  `,
  [UserFragment]
);

const UserActivity = theGraphGraphqlStarterkits(
  `
  query UserData($id: Bytes!) {
    accounts(where: { id: $id }){
      id
      lastActivity
      balances {
        value
      }
    }
    stats: portfolioStats_collection(interval: hour, where: { account_: { id: $id } }, first: 1) {
      totalBalance
    }
    assetEvents(orderBy: timestamp, orderDirection: desc, where: { emitter_: { id: $id } }) {
      id
    }
  }
`,
  []
);

export type DetailUser = FragmentOf<typeof UserFragment> & {
  lastActivity: string | undefined;
  totalBalance: string;
  assetCount: number;
  transactionCount: number;
};

export async function getUser(id: string): Promise<DetailUser> {
  const result = await hasuraClient.request(UserQuery, { id });
  const user = result.user_by_pk;
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  const userData = await theGraphClientStarterkits.request(UserActivity, {
    id: user.wallet,
  });
  return {
    ...user,
    lastActivity: userData.accounts[0].lastActivity,
    totalBalance: userData.stats[0].totalBalance,
    assetCount: userData.stats.length,
    transactionCount: userData.assetEvents.length,
  };
}
