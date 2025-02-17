import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-hasura';

const ListUserFragment = hasuraGraphql(`
  fragment ListUserFields on user {
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
  }
`);

const UsersQuery = hasuraGraphql(
  `
  query UsersQuery {
    user {
      ...ListUserFields
    }
  }
  `,
  [ListUserFragment]
);

const UserActivity = theGraphGraphqlStarterkits(
  `
  query UserActivity {
    accounts(where: { isContract: false }){
      id
      lastActivity
    }
  }
`,
  []
);

export type ListUser = FragmentOf<typeof ListUserFragment> & {
  lastActivity: string | undefined;
};

export async function getUsers(): Promise<ListUser[]> {
  const [{ user: users }, { accounts }] = await Promise.all([
    hasuraClient.request(UsersQuery),
    theGraphClientStarterkits.request(UserActivity),
  ]);
  return users.map((user) => {
    return {
      ...user,
      lastActivity: accounts.find((account) => account.id.toLowerCase() === user.wallet.toLowerCase())?.lastActivity,
    };
  });
}
