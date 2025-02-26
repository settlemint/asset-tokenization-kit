import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  RecentUsersCountFragment,
  RecentUsersCountFragmentSchema,
  UserFragment,
  UserFragmentSchema,
} from './user-fragment';

const RecentUsers = hasuraGraphql(
  `
  query RecentUsers($createdAfter: timestamptz!) {
    user_aggregate(
      where: { created_at: { _gt: $createdAfter } }
    ) {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
  }
`,
  [RecentUsersCountFragment]
);

const TotalUsers = hasuraGraphql(
  `
  query TotalUsers {
    user_aggregate {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
  }
`,
  [RecentUsersCountFragment]
);

/**
 * GraphQL query to count users created since a specific date
 *
 * @remarks
 * Retrieves all users created after the specified timestamp
 */
const UserCount = hasuraGraphql(
  `
  query UserCount($since: timestamptz!) {
    user(where: {created_at: {_gt: $since}}) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * Props interface for user count components
 *
 */
export interface UserCountProps {
  /** Date to count users from */
  since: Date;
}

/**
 * Fetches and processes user count data
 *
 * @param params - Object containing the date to count from
 *
 * @remarks
 * Each entry represents a single user with their creation timestamp
 * Returns an empty array if an error occurs during the query
 */
async function getUserCount({ since }: UserCountProps) {
  try {
    const result = await hasuraClient.request(UserCount, {
      since: since.toISOString(),
    });

    // Parse and validate each user in the results using Zod schema
    const validatedUsers = (result.user || []).map((user) =>
      safeParseWithLogging(UserFragmentSchema, user, 'user count')
    );

    const recentUsers = await hasuraClient.request(RecentUsers, {
      createdAfter: since.toISOString(),
    });

    const recentUsersCount = safeParseWithLogging(
      RecentUsersCountFragmentSchema,
      recentUsers.user_aggregate.aggregate,
      'recent users count'
    );

    const totalUsers = await hasuraClient.request(TotalUsers);
    const totalUsersCount = safeParseWithLogging(
      RecentUsersCountFragmentSchema,
      totalUsers.user_aggregate.aggregate,
      'total users count'
    );

    return {
      users: validatedUsers.map((user) => ({
        timestamp: user.created_at,
        users: 1, // Each entry represents a single user
      })),
      recentUsersCount: recentUsersCount.count,
      totalUsersCount: totalUsersCount.count,
    };
  } catch {
    return {
      users: [],
      recentUsersCount: 0,
      totalUsersCount: 0,
    };
  }
}

/**
 * Creates a memoized query key for user count queries
 *
 * @param params - Object containing the date to count from
 */
const getQueryKey = ({ since }: UserCountProps) =>
  ['user', 'count', since ? since.toISOString() : 'all-time'] as const;

/**
 * React Query hook for fetching user count data
 *
 * @param params - Object containing the date to count from
 *
 * @example
 * ```tsx
 * // Count users created in the last 30 days
 * const thirtyDaysAgo = new Date();
 * thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 *
 * const { data: userCounts, isLoading } = useUserCount({
 *   since: thirtyDaysAgo
 * });
 *
 * // Later in your component
 * const totalUsers = userCounts?.reduce((sum, entry) => sum + entry.users, 0) || 0;
 * ```
 */
export function useUserCount({ since }: UserCountProps) {
  const queryKey = getQueryKey({ since });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getUserCount({ since }),
  });

  return {
    ...result,
    queryKey,
  };
}
