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
 * Fetches user count statistics
 *
 * @param params - Optional param to specify a date from which to count recent users
 * @returns Object containing user data with timestamps, recent user count, and total user count
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
    users: validatedUsers.map((user) => ({
      timestamp: user.created_at,
      users: 1, // Each entry represents a single user
    })),
    recentUsersCount: recentUsersCount.count,
    totalUsersCount: totalUsersCount.count,
  };
});
