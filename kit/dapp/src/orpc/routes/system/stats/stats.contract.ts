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
import { StatsTopicSchemeClaimsCoverageOutputSchema } from "@/orpc/routes/system/stats/routes/topic-scheme-claims-coverage.schema";
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
import { z } from "zod";

const statsAssets = baseContract
  .route({
    method: "GET",
    path: "/system/stats/assets",
    description: "Retrieve system-wide asset statistics and metrics",
    successDescription: "System asset statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsAssetsOutputSchema);

const statsAssetLifecycleByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-lifecycle/by-range",
    description:
      "Retrieve counts for created and launched assets over custom time range",
    successDescription: "System asset lifecycle metrics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsAssetLifecycleOutputSchema);

const statsAssetLifecycleByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-lifecycle/by-preset/{preset}",
    description:
      "Retrieve counts for created and launched assets using preset range",
    successDescription: "System asset lifecycle metrics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsAssetLifecycleOutputSchema);

const statsAssetActivityByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-activity/by-range",
    description:
      "Retrieve counts for transfer, mint, and burn events over custom time range",
    successDescription: "System asset activity metrics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsAssetActivityOutputSchema);

const statsAssetActivityByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/asset-activity/by-preset/{preset}",
    description:
      "Retrieve counts for transfer, mint, and burn events using preset range",
    successDescription: "System asset activity metrics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsAssetActivityOutputSchema);

const statsClaimsStatsByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/claims-stats/by-range",
    description:
      "Retrieve claims statistics over custom time range including issued, active, removed, and revoked claims",
    successDescription: "Claims statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsClaimsStatsOutputSchema);

const statsClaimsStatsByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/claims-stats/by-preset/{preset}",
    description:
      "Retrieve claims statistics using preset range including issued, active, removed, and revoked claims",
    successDescription: "Claims statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsClaimsStatsOutputSchema);

const statsClaimsStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/claims-stats-state",
    description:
      "Retrieve current claims statistics state including issued, active, removed, and revoked claims",
    successDescription: "Claims statistics state retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsClaimsStatsStateOutputSchema);

const statsIdentityCount = baseContract
  .route({
    method: "GET",
    path: "/system/stats/identity-count",
    description: "Retrieve count of identities created by the identity factory",
    successDescription:
      "Identity factory creation count statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsIdentityCountOutputSchema);

const statsIdentityStatsOverTimeByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/identity-stats-over-time/by-range",
    description:
      "Retrieve identity statistics over custom time range for charts",
    successDescription: "Identity statistics over time retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsIdentityStatsOverTimeOutputSchema);

const statsIdentityStatsOverTimeByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/identity-stats-over-time/by-preset/{preset}",
    description: "Retrieve identity statistics using preset range for charts",
    successDescription: "Identity statistics over time retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsIdentityStatsOverTimeOutputSchema);

const statsTransactionCount = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-count",
    description: "Retrieve system-wide transaction count statistics",
    successDescription:
      "System transaction count statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(StatsTransactionCountInputSchema)
  .output(StatsTransactionCountOutputSchema);

const statsTransactionHistory = baseContract
  .route({
    method: "GET",
    path: "/system/stats/transaction-history",
    description: "Retrieve system-wide transaction history and trends",
    successDescription: "System transaction history retrieved successfully",
    tags: ["system-stats"],
  })
  .input(StatsTransactionHistoryInputSchema)
  .output(StatsTransactionHistoryOutputSchema);

const statsTrustedIssuerStatsByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/trusted-issuer-stats/by-range",
    description:
      "Retrieve trusted issuer statistics over custom time range including added, active, and removed issuers",
    successDescription: "Trusted issuer statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsTrustedIssuerStatsOutputSchema);

const statsTrustedIssuerStatsByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/trusted-issuer-stats/by-preset/{preset}",
    description:
      "Retrieve trusted issuer statistics using preset range including added, active, and removed issuers",
    successDescription: "Trusted issuer statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsTrustedIssuerStatsOutputSchema);

const statsTrustedIssuerStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/trusted-issuer-stats-state",
    description:
      "Retrieve current trusted issuer statistics state including added, active, and removed issuers",
    successDescription:
      "Trusted issuer statistics state retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsTrustedIssuerStatsStateOutputSchema);

const statsValue = baseContract
  .route({
    method: "GET",
    path: "/system/stats/value",
    description: "Retrieve system-wide value metrics and statistics",
    successDescription: "System value statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsValueOutputSchema);

const statsPortfolioByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/portfolio/by-range",
    description:
      "Retrieve system-wide portfolio statistics over custom time range",
    successDescription: "System portfolio statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsPortfolioOutputSchema);

const statsPortfolioByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/portfolio/by-preset/{preset}",
    description: "Retrieve system-wide portfolio statistics using preset range",
    successDescription: "System portfolio statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsPortfolioOutputSchema);

const statsPortfolioDetails = baseContract
  .route({
    method: "GET",
    path: "/system/stats/portfolio/details",
    description: "Retrieve detailed portfolio breakdown by token factory",
    successDescription: "Portfolio details retrieved successfully",
    tags: ["system-stats"],
  })
  .input(StatsPortfolioDetailsInputSchema)
  .output(StatsPortfolioDetailsOutputSchema);

const statsTopicSchemesStatsByRange = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-schemes-stats/by-range",
    description:
      "Retrieve topic schemes statistics over custom time range including registered, active, and removed schemes",
    successDescription: "Topic schemes statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      interval: z.enum(["hour", "day"]),
      from: z.date(),
      to: z.date(),
    })
  )
  .output(StatsTopicSchemesStatsOutputSchema);

const statsTopicSchemesStatsByPreset = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-schemes-stats/by-preset/{preset}",
    description:
      "Retrieve topic schemes statistics using preset range including registered, active, and removed schemes",
    successDescription: "Topic schemes statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .input(
    z.object({
      preset: z.enum(["trailing24Hours", "trailing7Days"]),
    })
  )
  .output(StatsTopicSchemesStatsOutputSchema);

const statsTopicSchemesStatsState = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-schemes-stats-state",
    description:
      "Retrieve current topic schemes statistics state including registered, active, and removed schemes",
    successDescription: "Topic schemes statistics state retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsTopicSchemesStatsStateOutputSchema);

const statsTopicSchemeClaimsCoverage = baseContract
  .route({
    method: "GET",
    path: "/system/stats/topic-scheme-claims-coverage",
    description:
      "Retrieve topic schemes that have no active claims, identifying coverage gaps in the claim system",
    successDescription:
      "Topic scheme claims coverage statistics retrieved successfully",
    tags: ["system-stats"],
  })
  .output(StatsTopicSchemeClaimsCoverageOutputSchema);

export const statsContract = {
  assets: statsAssets,
  assetLifecycleByRange: statsAssetLifecycleByRange,
  assetLifecycleByPreset: statsAssetLifecycleByPreset,
  assetActivityByRange: statsAssetActivityByRange,
  assetActivityByPreset: statsAssetActivityByPreset,
  claimsStatsByRange: statsClaimsStatsByRange,
  claimsStatsByPreset: statsClaimsStatsByPreset,
  claimsStatsState: statsClaimsStatsState,
  identityCount: statsIdentityCount,
  identityStatsOverTimeByRange: statsIdentityStatsOverTimeByRange,
  identityStatsOverTimeByPreset: statsIdentityStatsOverTimeByPreset,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  topicSchemesStatsByRange: statsTopicSchemesStatsByRange,
  topicSchemesStatsByPreset: statsTopicSchemesStatsByPreset,
  topicSchemesStatsState: statsTopicSchemesStatsState,
  topicSchemeClaimsCoverage: statsTopicSchemeClaimsCoverage,
  trustedIssuerStatsByRange: statsTrustedIssuerStatsByRange,
  trustedIssuerStatsByPreset: statsTrustedIssuerStatsByPreset,
  trustedIssuerStatsState: statsTrustedIssuerStatsState,
  value: statsValue,
  portfolioByRange: statsPortfolioByRange,
  portfolioByPreset: statsPortfolioByPreset,
  portfolioDetails: statsPortfolioDetails,
};
