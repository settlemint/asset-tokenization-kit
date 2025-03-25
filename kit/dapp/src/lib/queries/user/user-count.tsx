import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import { RecentUsersCountFragment, UserFragment } from "./user-fragment";
import { UserCountSchema, UserSchema } from "./user-schema";

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
    user(order_by: { created_at: asc }) {
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
  /** Array of daily user counts with cumulative totals */
  users: { timestamp: Date; users: number }[];
  /** Count of recent users */
  recentUsersCount: number;
  /** Total user count */
  totalUsersCount: number;
};

/**
 * Groups users by date and calculates cumulative count
 *
 * @param users - Array of users with creation timestamps
 * @returns Array of daily cumulative user counts
 */
function calculateCumulativeUsersByDay(users: { created_at: Date }[]) {
  if (!users.length) return [];

  const dailyCounts = new Map<string, number>();

  // Group users by day
  users.forEach((user) => {
    const dateStr = user.created_at.toISOString().split("T")[0];
    dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
  });

  // Convert to array and sort by date
  const sortedDays = Array.from(dailyCounts.entries()).sort(
    ([dateA], [dateB]) => dateA.localeCompare(dateB)
  );

  // Calculate cumulative count
  let cumulativeCount = 0;
  return sortedDays.map(([dateStr, count]) => {
    cumulativeCount += count;
    return {
      timestamp: new Date(dateStr),
      users: cumulativeCount,
    };
  });
}

/**
 * Fetches user count statistics with cumulative daily totals
 *
 * @param params - Optional param to specify a date from which to count recent users
 * @returns Object containing daily cumulative user data, recent user count, and total user count
 */
export const getUserCount = cache(async ({ since }: UserCountProps = {}) => {
  // Default to 30 days ago if no date is provided
  const date = since ? since : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await hasuraClient.request(UserCount, {
    date: date.toISOString(),
  });

  // Validate the response using TypeBox schemas
  const recentUsersCount = safeParse(
    UserCountSchema,
    result.recentUsers.aggregate
  );

  const totalUsersCount = safeParse(
    UserCountSchema,
    result.totalUsers.aggregate
  );

  // Parse and validate each user in the results
  const validatedUsers = safeParse(
    t.Array(UserSchema),
    Array.isArray(result.user) ? result.user : []
  );

  return {
    users: calculateCumulativeUsersByDay(validatedUsers),
    recentUsersCount: recentUsersCount.count,
    totalUsersCount: totalUsersCount.count,
  };
});
