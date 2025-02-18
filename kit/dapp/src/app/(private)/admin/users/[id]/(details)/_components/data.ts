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
  query UserData($accountId: ID!, $senderIdFilter: Bytes!) {
    account(id: $accountId) {
      id
      lastActivity
      balances(first: 1000) {
        id
      }
    }
    transferEvents(where: { sender_: { id: $senderIdFilter } }) {
      id
    }
  }
`,
  []
);

export type DetailUser = FragmentOf<typeof UserFragment> & {
  lastActivity: string | undefined;
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
    accountId: user.wallet,
    senderIdFilter: user.wallet,
  });
  return {
    ...user,
    lastActivity: userData.account?.lastActivity,
    assetCount: userData.account?.balances.length ?? 0,
    transactionCount: userData.transferEvents.length,
  };
}
