import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
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

export type DetailUser = FragmentOf<typeof UserFragment>;

export async function getUser(id: string): Promise<DetailUser> {
  const result = await hasuraClient.request(UserQuery, { id });
  const user = result.user_by_pk;
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return user;
}
