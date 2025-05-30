import "server-only";

import { withTracing } from "@/lib/utils/tracing";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getUserCount } from "./user-count";

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

    // Get total platform users using the same method as the working UsersWidget
    const userCountResult = await getUserCount();

    console.log("KYC Stats - getUserCount result:", userCountResult);

    return {
      kycVerifiedCount: userCountResult.totalUsersCount,
      pendingVerificationCount: 0, // Will implement proper counts later
      blockedUsersCount: 0, // Will implement proper counts later
    };
  }
);
