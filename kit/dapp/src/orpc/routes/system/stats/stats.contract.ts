import { baseContract } from "@/orpc/procedures/base.contract";
import { StatsAssetsOutputSchema } from "@/orpc/routes/system/stats/routes/assets.schema";
import { StatsIdentityCountOutputSchema } from "@/orpc/routes/system/stats/routes/identity-count.schema";
import {
  StatsIdentityStatsOverTimeInputSchema,
  StatsIdentityStatsOverTimeOutputSchema,
} from "@/orpc/routes/system/stats/routes/identity-stats-over-time.schema";
import {
  StatsPortfolioDetailsInputSchema,
  StatsPortfolioDetailsOutputSchema,
} from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import {
  StatsPortfolioInputSchema,
  StatsPortfolioOutputSchema,
} from "@/orpc/routes/system/stats/routes/portfolio.schema";
import {
  StatsTransactionCountInputSchema,
  StatsTransactionCountOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-count.schema";
import {
  StatsTransactionHistoryInputSchema,
  StatsTransactionHistoryOutputSchema,
} from "@/orpc/routes/system/stats/routes/transaction-history.schema";
import { StatsValueOutputSchema } from "@/orpc/routes/system/stats/routes/value.schema";

const statsAssets = baseContract
  .route({
    method: "GET",
    path: "/system/stats/assets",
    description: "Retrieve system-wide asset statistics and metrics",
    successDescription: "System asset statistics retrieved successfully",
    tags: ["stats", "system"],
  })
  .output(StatsAssetsOutputSchema);

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
  .input(StatsIdentityStatsOverTimeInputSchema)
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
  .input(StatsPortfolioInputSchema)
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

export const statsContract = {
  assets: statsAssets,
  identityCount: statsIdentityCount,
  identityStatsOverTime: statsIdentityStatsOverTime,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
  portfolio: statsPortfolio,
  portfolioDetails: statsPortfolioDetails,
};
