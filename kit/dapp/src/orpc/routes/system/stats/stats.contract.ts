import { baseContract } from "@/orpc/procedures/base.contract";
import { StatsAssetActivityOutputSchema } from "@/orpc/routes/system/stats/routes/asset-activity.schema";
import { StatsAssetLifecycleOutputSchema } from "@/orpc/routes/system/stats/routes/asset-lifecycle.schema";
import { StatsAssetsOutputSchema } from "@/orpc/routes/system/stats/routes/assets.schema";
import { StatsClaimsStatsOutputSchema } from "@/orpc/routes/system/stats/routes/claims-stats.schema";
import { StatsClaimsStatsStateOutputSchema } from "@/orpc/routes/system/stats/routes/claims-stats-state.schema";
import { StatsIdentityCountOutputSchema } from "@/orpc/routes/system/stats/routes/identity-count.schema";
import { StatsIdentityStatsOverTimeOutputSchema } from "@/orpc/routes/system/stats/routes/identity-stats-over-time.schema";
import {
  StatsPortfolioDetailsInputSchema,
  StatsPortfolioDetailsOutputSchema,
} from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import { StatsPortfolioOutputSchema } from "@/orpc/routes/system/stats/routes/portfolio.schema";
import { StatsTopicSchemesStatsOutputSchema } from "@/orpc/routes/system/stats/routes/topic-schemes-stats.schema";
import { StatsTopicSchemesStatsStateOutputSchema } from "@/orpc/routes/system/stats/routes/topic-schemes-stats-state.schema";
import {
  StatsTransactionCountInputSchema,
  StatsTransactionCountOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-count.schema";
import {
  StatsTransactionHistoryInputSchema,
  StatsTransactionHistoryOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-history.schema";
import { StatsTrustedIssuerStatsOutputSchema } from "@/orpc/routes/system/stats/routes/trusted-issuer-stats.schema";
import { StatsTrustedIssuerStatsStateOutputSchema } from "@/orpc/routes/system/stats/routes/trusted-issuer-stats-state.schema";
import { StatsValueOutputSchema } from "@/orpc/routes/system/stats/routes/value.schema";
import { StatsRangeInputSchema } from "@atk/zod/stats-range";

const statsAssets = baseContract
  .route({
    method: "GET",
    path: "/system/stats/assets",
    description: "Retrieve system-wide asset statistics and metrics",
    successDescription: "System asset statistics retrieved successfully",
    tags: ["stats", "system"],
  })
  .output(StatsAssetsOutputSchema);

const statsAssetLifecycle = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-lifecycle",
    description: "Retrieve counts for created and launched assets over time",
    successDescription: "System asset lifecycle metrics retrieved successfully",
    tags: ["stats", "system", "assets"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsAssetLifecycleOutputSchema);

const statsAssetActivity = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-activity",
    description:
      "Retrieve counts for transfer, mint, and burn events over time",
    successDescription: "System asset activity metrics retrieved successfully",
    tags: ["stats", "system", "assets"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsAssetActivityOutputSchema);

const statsClaimsStats = baseContract
  .route({
    method: "GET",
    path: "/system/stats/claims-stats",
    description:
      "Retrieve claims statistics over time including issued, active, removed, and revoked claims",
    successDescription: "Claims statistics retrieved successfully",
    tags: ["stats", "system", "claims"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsClaimsStatsOutputSchema);

const statsClaimsStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/claims-stats-state",
    description:
      "Retrieve current claims statistics state including issued, active, removed, and revoked claims",
    successDescription: "Claims statistics state retrieved successfully",
    tags: ["stats", "system", "claims"],
  })
  .output(StatsClaimsStatsStateOutputSchema);

const statsIdentityCount = baseContract
  .route({
    method: "GET",
    path: "/system/stats/identity-count",
    description: "Retrieve count of identities created by the identity factory",
    successDescription:
      "Identity factory creation count statistics retrieved successfully",
    tags: ["stats", "system", "identity"],
  })
  .output(StatsIdentityCountOutputSchema);

const statsIdentityStatsOverTime = baseContract
  .route({
    method: "GET",
    path: "/system/stats/identity-stats-over-time",
    description: "Retrieve identity statistics over time for charts",
    successDescription: "Identity statistics over time retrieved successfully",
    tags: ["stats", "system", "identity"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsIdentityStatsOverTimeOutputSchema);

const statsTransactionCount = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-count",
    description: "Retrieve system-wide transaction count statistics",
    successDescription:
      "System transaction count statistics retrieved successfully",
    tags: ["stats", "system"],
  })
  .input(StatsTransactionCountInputSchema)
  .output(StatsTransactionCountOutputSchema);

const statsTransactionHistory = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-history",
    description: "Retrieve system-wide transaction history and trends",
    successDescription: "System transaction history retrieved successfully",
    tags: ["stats", "system"],
  })
  .input(StatsTransactionHistoryInputSchema)
  .output(StatsTransactionHistoryOutputSchema);

const statsTrustedIssuerStats = baseContract
  .route({
    method: "GET",
    path: "/system/stats/trusted-issuer-stats",
    description:
      "Retrieve trusted issuer statistics over time including added, active, and removed issuers",
    successDescription: "Trusted issuer statistics retrieved successfully",
    tags: ["stats", "system", "trusted-issuers"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsTrustedIssuerStatsOutputSchema);

const statsTrustedIssuerStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/trusted-issuer-stats-state",
    description:
      "Retrieve current trusted issuer statistics state including added, active, and removed issuers",
    successDescription:
      "Trusted issuer statistics state retrieved successfully",
    tags: ["stats", "system", "trusted-issuers"],
  })
  .output(StatsTrustedIssuerStatsStateOutputSchema);

const statsValue = baseContract
  .route({
    method: "GET",
    path: "/system/stats/value",
    description: "Retrieve system-wide value metrics and statistics",
    successDescription: "System value statistics retrieved successfully",
    tags: ["stats", "system"],
  })
  .output(StatsValueOutputSchema);

const statsPortfolio = baseContract
  .route({
    method: "GET",
    path: "/system/stats/portfolio",
    description: "Retrieve system-wide portfolio statistics",
    successDescription: "System portfolio statistics retrieved successfully",
    tags: ["stats", "system"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsPortfolioOutputSchema);

const statsPortfolioDetails = baseContract
  .route({
    method: "GET",
    path: "/system/stats/portfolio/details",
    description: "Retrieve detailed portfolio breakdown by token factory",
    successDescription: "Portfolio details retrieved successfully",
    tags: ["stats", "system"],
  })
  .input(StatsPortfolioDetailsInputSchema)
  .output(StatsPortfolioDetailsOutputSchema);

const statsTopicSchemesStats = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-schemes-stats",
    description:
      "Retrieve topic schemes statistics over time including registered, active, and removed schemes",
    successDescription: "Topic schemes statistics retrieved successfully",
    tags: ["stats", "system", "topic-schemes"],
  })
  .input(StatsRangeInputSchema)
  .output(StatsTopicSchemesStatsOutputSchema);

const statsTopicSchemesStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-schemes-stats-state",
    description:
      "Retrieve current topic schemes statistics state including registered, active, and removed schemes",
    successDescription: "Topic schemes statistics state retrieved successfully",
    tags: ["stats", "system", "topic-schemes"],
  })
  .output(StatsTopicSchemesStatsStateOutputSchema);

export const statsContract = {
  assets: statsAssets,
  assetLifecycle: statsAssetLifecycle,
  assetActivity: statsAssetActivity,
  claimsStats: statsClaimsStats,
  claimsStatsState: statsClaimsStatsState,
  identityCount: statsIdentityCount,
  identityStatsOverTime: statsIdentityStatsOverTime,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  topicSchemesStats: statsTopicSchemesStats,
  topicSchemesStatsState: statsTopicSchemesStatsState,
  trustedIssuerStats: statsTrustedIssuerStats,
  trustedIssuerStatsState: statsTrustedIssuerStatsState,
  value: statsValue,
  portfolio: statsPortfolio,
  portfolioDetails: statsPortfolioDetails,
};
