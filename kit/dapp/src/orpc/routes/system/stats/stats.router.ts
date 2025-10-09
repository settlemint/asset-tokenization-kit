import { statsAssetActivity } from "@/orpc/routes/system/stats/routes/asset-activity";
import { statsAssetLifecycle } from "@/orpc/routes/system/stats/routes/asset-lifecycle";
import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import { statsClaimsStats } from "@/orpc/routes/system/stats/routes/claims-stats";
import { statsIdentityCount } from "@/orpc/routes/system/stats/routes/identity-count";
import { statsIdentityStatsOverTime } from "@/orpc/routes/system/stats/routes/identity-stats-over-time";
import { statsPortfolio } from "@/orpc/routes/system/stats/routes/portfolio";
import { statsPortfolioDetails } from "@/orpc/routes/system/stats/routes/portfolio-details";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
  assets: statsAssets,
  assetLifecycle: statsAssetLifecycle,
  assetActivity: statsAssetActivity,
  claimsStats: statsClaimsStats,
  identityCount: statsIdentityCount,
  identityStatsOverTime: statsIdentityStatsOverTime,
  portfolio: statsPortfolio,
  portfolioDetails: statsPortfolioDetails,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
};

export default routes;
