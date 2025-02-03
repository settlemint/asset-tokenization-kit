'use server';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import type { FragmentOf } from '@settlemint/sdk-hasura';
import { unstable_cache } from 'next/cache';

const USERS_QUERY_KEY = 'users';
const USER_QUERY_KEY = (id: string) => `user-${id}`;

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
  }
`);

const UsersForOrganizationQuery = hasuraGraphql(
  `
  query UsersForOrganizationQuery($organizationId: String!) {
    organization(where: { id: { _eq: $organizationId } }) {
      id
      name
      members {
        user {
          ...UserFields
        }
      }
    }
  }
  `,
  [UserFragment]
);

const UserQuery = hasuraGraphql(
  `
  query User($userId: String!) {
    user(where: { id: {_eq: $userId } }) {
        ...UserFields
    }
  }
  `,
  [UserFragment]
);

export type User = FragmentOf<typeof UserFragment>;

export async function getUsers(organizationId: string) {
  return unstable_cache(
    async () => {
      const { organization } = await hasuraClient.request(UsersForOrganizationQuery, { organizationId });
      if (!organization || organization.length === 0) {
        throw new Error(`Organization with id ${organizationId} not found`);
      }
      return organization[0].members.map((member) => member.user);
    },
    [USERS_QUERY_KEY],
    {
      revalidate: 60,
      tags: [USERS_QUERY_KEY],
    }
  )();
}

export async function getUser(id: string) {
  return unstable_cache(
    async () => {
      const result = await hasuraClient.request(UserQuery, { userId: id });
      const user = result.user.find((user) => user.id === id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    },
    [USER_QUERY_KEY(id)],
    {
      revalidate: 60,
      tags: [USER_QUERY_KEY(id)],
    }
  )();
}
