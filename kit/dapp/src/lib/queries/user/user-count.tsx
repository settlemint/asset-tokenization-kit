import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import {
  RecentUsersCountFragment,
  RecentUsersCountFragmentSchema,
  UserFragment,
  UserFragmentSchema,
} from './user-fragment';

/**
 * GraphQL query to get users, with an optional filter for recent users
 */
const UserCount = hasuraGraphql(
  `
  query UserCount($date: timestamptz!) {
    recentUsers: user_aggregate(where: { created_at: { _gte: $date } }) {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
    totalUsers: user_aggregate {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
    user(limit: 3, order_by: { created_at: desc }) {
      ...UserFragment
    }
  }
`,
  [UserFragment, RecentUsersCountFragment]
);

/**
 * Props interface for retrieving user counts
 */
export interface UserCountProps {
  /** Date to count users from (optional) */
  since?: Date;
}

/**
 * Type for user count results
 */
export type UserCountResult = {
  /** Array of users with their timestamps */
  users: { timestamp: Date; users: number }[];
  /** Count of recent users */
  recentUsersCount: number;
  /** Total user count */
  totalUsersCount: number;
};

/**
 * Cached function to fetch raw user count data
 */
const fetchUserCountData = unstable_cache(
  async (since: Date | undefined) => {
    // Default to 30 days ago if no date is provided
    const date = since
      ? since
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await hasuraClient.request(UserCount, {
      date: date.toISOString(),
    });

    return result;
  },
  ['user', 'count'],
  {
    revalidate: 60 * 60,
    tags: ['user'],
  }
);

/**
 * Fetches user count statistics
 *
 * @param params - Optional param to specify a date from which to count recent users
 * @returns Object containing user data with timestamps, recent user count, and total user count
 */
export const getUserCount = cache(async ({ since }: UserCountProps = {}) => {
  const result = await fetchUserCountData(since);

  // Validate the response using Zod schemas
  const validatedRecentUsers = safeParseWithLogging(
    RecentUsersCountFragmentSchema,
    result.recentUsers.aggregate,
    'recent users count'
  );

  const validatedTotalUsers = safeParseWithLogging(
    RecentUsersCountFragmentSchema,
    result.totalUsers.aggregate,
    'total users count'
  );

  // Parse and validate each user in the results using the UserFragmentSchema
  const validatedUsers = Array.isArray(result.user)
    ? result.user.map((user) =>
        safeParseWithLogging(UserFragmentSchema, user, 'user count')
      )
    : [];

  return {
    users: validatedUsers.map((user) => ({
      timestamp: user.created_at,
      users: 1, // Each entry represents a single user
    })),
    recentUsersCount: validatedRecentUsers.count,
    totalUsersCount: validatedTotalUsers.count,
  };
});
