import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { UserFragment, UserFragmentSchema } from './user-fragment';

/**
 * GraphQL query to fetch a single user by ID from Hasura
 *
 * @remarks
 * Returns user details like name, email, wallet address, and timestamps
 */
const UserDetail = hasuraGraphql(
  `
  query UserDetail($id: String!) {
    user_by_pk(id: $id) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * Props interface for user detail components
 *
 */
export interface UserDetailProps {
  /** UUID of the user */
  id: string;
}

/**
 * Cached function to fetch raw user detail data
 */
const fetchUserDetailData = unstable_cache(
  async (id: string) => {
    const result = await hasuraClient.request(UserDetail, {
      id,
    });

    return result;
  },
  ['user', 'detail'],
  {
    revalidate: 60 * 60,
    tags: ['user'],
  }
);

/**
 * Fetches a user by ID
 *
 * @param params - Object containing the user ID
 * @throws Will throw an error if the user is not found
 */
export async function getUserDetail({ id }: UserDetailProps) {
  const result = await fetchUserDetailData(id);

  if (!result.user_by_pk) {
    throw new Error(`User not found with ID ${id}`);
  }

  // Validate the user data using the Zod schema
  return safeParseWithLogging(
    UserFragmentSchema,
    result.user_by_pk,
    'user detail'
  );
}

/**
 * Fetches a user by ID, returning null if not found
 *
 * @param params - Object containing the user ID
 */
export async function getOptionalUserDetail({ id }: UserDetailProps) {
  try {
    return await getUserDetail({ id });
  } catch {
    return null;
  }
}
