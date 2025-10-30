import { statsAssetActivity } from "@/orpc/routes/system/stats/routes/asset-activity";
import { statsAssetLifecycle } from "@/orpc/routes/system/stats/routes/asset-lifecycle";
import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import { statsClaimsStats } from "@/orpc/routes/system/stats/routes/claims-stats";
import { statsClaimsStatsState } from "@/orpc/routes/system/stats/routes/claims-stats-state";
import { statsIdentityCount } from "@/orpc/routes/system/stats/routes/identity-count";
import { statsIdentityStatsOverTime } from "@/orpc/routes/system/stats/routes/identity-stats-over-time";
import { statsPortfolio } from "@/orpc/routes/system/stats/routes/portfolio";
import { statsPortfolioDetails } from "@/orpc/routes/system/stats/routes/portfolio-details";
import { statsTopicSchemeClaimsCoverage } from "@/orpc/routes/system/stats/routes/topic-scheme-claims-coverage";
import { statsTopicSchemesStats } from "@/orpc/routes/system/stats/routes/topic-schemes-stats";
import { statsTopicSchemesStatsState } from "@/orpc/routes/system/stats/routes/topic-schemes-stats-state";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import { statsTrustedIssuerStats } from "@/orpc/routes/system/stats/routes/trusted-issuer-stats";
import { statsTrustedIssuerStatsState } from "@/orpc/routes/system/stats/routes/trusted-issuer-stats-state";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
  assets: statsAssets,
  assetLifecycle: statsAssetLifecycle,
  assetActivity: statsAssetActivity,
  claimsStats: statsClaimsStats,
  claimsStatsState: statsClaimsStatsState,
  identityCount: statsIdentityCount,
  identityStatsOverTime: statsIdentityStatsOverTime,
  portfolio: statsPortfolio,
  portfolioDetails: statsPortfolioDetails,
  topicSchemeClaimsCoverage: statsTopicSchemeClaimsCoverage,
  topicSchemesStats: statsTopicSchemesStats,
  topicSchemesStatsState: statsTopicSchemesStatsState,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  trustedIssuerStats: statsTrustedIssuerStats,
  trustedIssuerStatsState: statsTrustedIssuerStatsState,
  value: statsValue,
};

export default routes;
