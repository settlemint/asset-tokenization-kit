import {
  statsAssetActivityByPreset,
  statsAssetActivityByRange,
} from "@/orpc/routes/system/stats/routes/asset-activity";
import {
  statsAssetLifecycleByPreset,
  statsAssetLifecycleByRange,
} from "@/orpc/routes/system/stats/routes/asset-lifecycle";
import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import {
  statsClaimsStatsByPreset,
  statsClaimsStatsByRange,
} from "@/orpc/routes/system/stats/routes/claims-stats";
import { statsClaimsStatsState } from "@/orpc/routes/system/stats/routes/claims-stats-state";
import { statsIdentityCount } from "@/orpc/routes/system/stats/routes/identity-count";
import {
  statsIdentityStatsOverTimeByPreset,
  statsIdentityStatsOverTimeByRange,
} from "@/orpc/routes/system/stats/routes/identity-stats-over-time";
import {
  statsPortfolioByPreset,
  statsPortfolioByRange,
} from "@/orpc/routes/system/stats/routes/portfolio";
import { statsPortfolioDetails } from "@/orpc/routes/system/stats/routes/portfolio-details";
import { statsTopicSchemeClaimsCoverage } from "@/orpc/routes/system/stats/routes/topic-scheme-claims-coverage";
import {
  statsTopicSchemesStatsByPreset,
  statsTopicSchemesStatsByRange,
} from "@/orpc/routes/system/stats/routes/topic-schemes-stats";
import { statsTopicSchemesStatsState } from "@/orpc/routes/system/stats/routes/topic-schemes-stats-state";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import {
  statsTrustedIssuerStatsByPreset,
  statsTrustedIssuerStatsByRange,
} from "@/orpc/routes/system/stats/routes/trusted-issuer-stats";
import { statsTrustedIssuerStatsState } from "@/orpc/routes/system/stats/routes/trusted-issuer-stats-state";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
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
  portfolioByRange: statsPortfolioByRange,
  portfolioByPreset: statsPortfolioByPreset,
  portfolioDetails: statsPortfolioDetails,
  topicSchemeClaimsCoverage: statsTopicSchemeClaimsCoverage,
  topicSchemesStatsByRange: statsTopicSchemesStatsByRange,
  topicSchemesStatsByPreset: statsTopicSchemesStatsByPreset,
  topicSchemesStatsState: statsTopicSchemesStatsState,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  trustedIssuerStatsByRange: statsTrustedIssuerStatsByRange,
  trustedIssuerStatsByPreset: statsTrustedIssuerStatsByPreset,
  trustedIssuerStatsState: statsTrustedIssuerStatsState,
  value: statsValue,
};

export default routes;
