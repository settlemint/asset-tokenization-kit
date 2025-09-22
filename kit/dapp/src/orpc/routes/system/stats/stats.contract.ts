import { baseContract } from "@/orpc/procedures/base.contract";
import { StatsAssetsOutputSchema } from "@/orpc/routes/system/stats/routes/assets.schema";
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

export const statsContract = {
  assets: statsAssets,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
  portfolio: statsPortfolio,
};
