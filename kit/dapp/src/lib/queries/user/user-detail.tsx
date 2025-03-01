import {
  AccountFragment,
  AccountFragmentSchema,
} from '@/lib/queries/accounts/accounts-fragment';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
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
 * GraphQL query to fetch user activity from TheGraph
 *
 * @remarks
 * Retrieves account with its last activity timestamp
 */
const UserActivity = theGraphGraphqlStarterkits(
  `
  query UserActivity($id: ID!) {
    account(id: $id) {
      ...AccountFragment
    }
  }
`,
  [AccountFragment]
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
    const userResult = await hasuraClient.request(UserDetail, {
      id,
    });

    if (!userResult.user_by_pk) {
      throw new Error(`User not found with ID ${id}`);
    }

    // Validate user data
    const validatedUser = safeParseWithLogging(
      UserFragmentSchema,
      userResult.user_by_pk,
      'user detail'
    );

    // Fetch activity data if user has wallet address
    if (validatedUser.wallet) {
      try {
        const activityResult = await theGraphClientStarterkits.request(
          UserActivity,
          {
            id: validatedUser.wallet.toLowerCase(),
          }
        );

        if (activityResult.account) {
          // Validate account data
          const validatedAccount = safeParseWithLogging(
            AccountFragmentSchema,
            activityResult.account,
            'account detail'
          );

          // Combine validated user data with validated activity data
          return {
            ...validatedAccount,
            ...validatedUser,
            assetCount: validatedAccount.balancesCount ?? 0,
            transactionCount: validatedAccount.activityEventsCount ?? 0,
          };
        }
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    }

    return {
      ...validatedUser,
      assetCount: 0,
      transactionCount: 0,
    };
  },
  ['user', 'detail', 'activity'],
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
export const getUserDetail = cache(async ({ id }: UserDetailProps) => {
  const result = await fetchUserDetailData(id);

  return result;
});

/**
 * Fetches a user by ID, returning null if not found
 *
 * @param params - Object containing the user ID
 */
export const getOptionalUserDetail = cache(async ({ id }: UserDetailProps) => {
  try {
    return await getUserDetail({ id });
  } catch {
    return null;
  }
});
