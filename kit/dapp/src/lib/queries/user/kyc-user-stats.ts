import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getUserCount } from "./user-count";
import { RecentUsersCountFragment } from "./user-fragment";
import { UserCountSchema } from "./user-schema";

/**
 * GraphQL query to get banned users count
 */
const BannedUsersCount = hasuraGraphql(
  `
  query BannedUsersCount {
    bannedUsers: user_aggregate(where: { banned: { _eq: true } }) {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
  }
`,
  [RecentUsersCountFragment]
);

/**
 * Type for KYC user statistics results
 */
export type KycUserStatsResult = {
  /** Count of total platform users (excluding banned) - used as verified holders */
  kycVerifiedCount: number;
  /** Count of users pending KYC verification (excluding banned) */
  pendingVerificationCount: number;
  /** Count of blocked/banned users */
  blockedUsersCount: number;
};

/**
 * Fetches KYC user statistics for monitoring dashboard
 *
 * @returns Object containing total platform users (as verified), pending, and blocked user counts
 */
export const getKycUserStats = withTracing(
  "queries",
  "getKycUserStats",
  async (): Promise<KycUserStatsResult> => {
    "use cache";
    cacheTag("user-activity");

    try {
      // Get total platform users and banned users count in parallel
      const [userCountResult, bannedUsersResult] = await Promise.all([
        getUserCount(),
        hasuraClient.request(BannedUsersCount, {}),
      ]);

      // Validate the banned users count response
      const bannedUsersCount = safeParse(
        UserCountSchema,
        bannedUsersResult.bannedUsers.aggregate
      );

      return {
        kycVerifiedCount: userCountResult.totalUsersCount,
        pendingVerificationCount: 0, // Will implement proper counts later if needed
        blockedUsersCount: bannedUsersCount.count,
      };
    } catch (error) {
      console.error("Error fetching KYC user stats:", error);
      // Return fallback values in case of error
      return {
        kycVerifiedCount: 0,
        pendingVerificationCount: 0,
        blockedUsersCount: 0,
      };
    }
  }
);
