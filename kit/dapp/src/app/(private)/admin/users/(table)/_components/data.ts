import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
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

export type ListUser = FragmentOf<typeof ListUserFragment>;

export async function getUsers(): Promise<ListUser[]> {
  const { user } = await hasuraClient.request(UsersQuery);
  return user;
}
