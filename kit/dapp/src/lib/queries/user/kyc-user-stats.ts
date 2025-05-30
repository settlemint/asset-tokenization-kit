import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { RecentUsersCountFragment } from "./user-fragment";
import { UserCountSchema } from "./user-schema";

/**
 * GraphQL query to get KYC user statistics
 */
const KycUserStats = hasuraGraphql(
  `
  query KycUserStats {
    kycVerifiedUsers: user_aggregate(where: { kyc_verified_at: { _is_null: false }, banned: { _neq: true } }) {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
    pendingVerificationUsers: user_aggregate(where: { kyc_verified_at: { _is_null: true }, banned: { _neq: true } }) {
      aggregate {
        ...RecentUsersCountFragment
      }
    }
    blockedUsers: user_aggregate(where: { banned: { _eq: true } }) {
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
  /** Count of KYC verified users (excluding banned) */
  kycVerifiedCount: number;
  /** Count of users pending KYC verification (excluding banned) */
  pendingVerificationCount: number;
  /** Count of blocked/banned users */
  blockedUsersCount: number;
};

/**
 * Fetches KYC user statistics for monitoring dashboard
 *
 * @returns Object containing KYC verified, pending, and blocked user counts
 */
export const getKycUserStats = withTracing(
  "queries",
  "getKycUserStats",
  async (): Promise<KycUserStatsResult> => {
    "use cache";
    cacheTag("user-activity");

    const result = await hasuraClient.request(KycUserStats, {});

    // Validate the response using TypeBox schemas
    const kycVerifiedCount = safeParse(
      UserCountSchema,
      result.kycVerifiedUsers.aggregate
    );

    const pendingVerificationCount = safeParse(
      UserCountSchema,
      result.pendingVerificationUsers.aggregate
    );

    const blockedUsersCount = safeParse(
      UserCountSchema,
      result.blockedUsers.aggregate
    );

    return {
      kycVerifiedCount: kycVerifiedCount.count,
      pendingVerificationCount: pendingVerificationCount.count,
      blockedUsersCount: blockedUsersCount.count,
    };
  }
);
