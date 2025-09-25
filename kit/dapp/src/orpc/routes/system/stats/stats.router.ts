import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import { statsIdentityCount } from "@/orpc/routes/system/stats/routes/identity-count";
import { statsIdentityStatsOverTime } from "@/orpc/routes/system/stats/routes/identity-stats-over-time";
import { statsPortfolio } from "@/orpc/routes/system/stats/routes/portfolio";
import { statsPortfolioDetails } from "@/orpc/routes/system/stats/routes/portfolio-details";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
  assets: statsAssets,
  identityCount: statsIdentityCount,
  identityStatsOverTime: statsIdentityStatsOverTime,
  portfolio: statsPortfolio,
  portfolioDetails: statsPortfolioDetails,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
};

export default routes;
