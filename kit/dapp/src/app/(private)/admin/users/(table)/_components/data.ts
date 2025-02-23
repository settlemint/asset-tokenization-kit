import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
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
  query UsersQuery($limit: Int, $offset: Int) {
    user(limit: $limit, offset: $offset) {
      ...ListUserFields
    }
  }
  `,
  [ListUserFragment]
);

const UserActivity = theGraphGraphqlStarterkits(
  `
  query UserActivity($first: Int, $skip: Int) {
    accounts(where: { isContract: false }, first: $first, skip: $skip) {
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
  const [users, accounts] = await Promise.all([
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(UsersQuery, { limit, offset });
      return result.user;
    }),
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(UserActivity, {
        first,
        skip,
      });
      return result.accounts;
    }),
  ]);
  return users.map((user) => {
    return {
      ...user,
      lastActivity: accounts.find(
        (account) => account.id.toLowerCase() === user.wallet.toLowerCase()
      )?.lastActivity,
    };
  });
}
