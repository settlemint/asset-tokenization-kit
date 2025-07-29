// Factory contracts
import { factoryCreateContract } from "@/orpc/routes/token/routes/factory/factory.create.contract";
import { factoryListContract } from "@/orpc/routes/token/routes/factory/factory.list.contract";
import { factoryReadContract } from "@/orpc/routes/token/routes/factory/factory.read.contract";

// Mutation contracts
import { tokenApproveContract } from "@/orpc/routes/token/routes/mutations/approve/token.approve.contract";
import { tokenBurnContract } from "@/orpc/routes/token/routes/mutations/burn/token.burn.contract";
import { tokenSetCapContract } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap.contract";
import { tokenAddComplianceModuleContract } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module.contract";
import { tokenRemoveComplianceModuleContract } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module.contract";
import { tokenCreateContract } from "@/orpc/routes/token/routes/mutations/create/token.create.contract";
import { tokenFreezeAddressContract } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address.contract";
import { tokenMintContract } from "@/orpc/routes/token/routes/mutations/mint/token.mint.contract";
import { tokenPauseContract } from "@/orpc/routes/token/routes/mutations/pause/token.pause.contract";
import { tokenUnpauseContract } from "@/orpc/routes/token/routes/mutations/pause/token.unpause.contract";
import { tokenForcedRecoverContract } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover.contract";
import { tokenRecoverERC20Contract } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20.contract";
import { tokenRecoverTokensContract } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens.contract";
import { tokenRedeemContract } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.contract";
import { tokenTransferContract } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.contract";
import { tokenSetYieldScheduleContract } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule.contract";

// Query contracts
import { tokenActionsContract } from "@/orpc/routes/token/routes/token.actions.contract";
import { tokenEventsContract } from "@/orpc/routes/token/routes/token.events.contract";
import { tokenHoldersContract } from "@/orpc/routes/token/routes/token.holders.contract";
import { tokenListContract } from "@/orpc/routes/token/routes/token.list.contract";
import { tokenReadContract } from "@/orpc/routes/token/routes/token.read.contract";

// Stats contracts
import { factoryPredictAddressContract } from "@/orpc/routes/token/routes/factory/factory.predict-address.contract";
import { tokenStatsActivityByAssetContract } from "@/orpc/routes/token/routes/stats/activity-by-asset.contract";
import { tokenStatsAssetCountContract } from "@/orpc/routes/token/routes/stats/asset-count.contract";
import { tokenStatsAssetsContract } from "@/orpc/routes/token/routes/stats/assets.contract";
import { tokenStatsSupplyDistributionContract } from "@/orpc/routes/token/routes/stats/supply-distribution.contract";
import { tokenStatsTotalValueContract } from "@/orpc/routes/token/routes/stats/total-value.contract";
import { tokenStatsTransactionCountContract } from "@/orpc/routes/token/routes/stats/transaction-count.contract";
import { tokenStatsTransactionHistoryContract } from "@/orpc/routes/token/routes/stats/transaction-history.contract";
import { tokenStatsTransactionsContract } from "@/orpc/routes/token/routes/stats/transactions.contract";
import { tokenStatsValueContract } from "@/orpc/routes/token/routes/stats/value.contract";

export const tokenContract = {
  // Factory
  factoryCreate: factoryCreateContract,
  factoryList: factoryListContract,
  factoryRead: factoryReadContract,
  factoryPredictAddress: factoryPredictAddressContract,

  // Mutations
  create: tokenCreateContract,
  pause: tokenPauseContract,
  unpause: tokenUnpauseContract,
  mint: tokenMintContract,
  burn: tokenBurnContract,
  transfer: tokenTransferContract,
  tokenApprove: tokenApproveContract,
  tokenRedeem: tokenRedeemContract,
  tokenFreezeAddress: tokenFreezeAddressContract,
  tokenRecoverTokens: tokenRecoverTokensContract,
  tokenForcedRecover: tokenForcedRecoverContract,
  tokenRecoverERC20: tokenRecoverERC20Contract,
  tokenSetCap: tokenSetCapContract,
  tokenSetYieldSchedule: tokenSetYieldScheduleContract,
  tokenAddComplianceModule: tokenAddComplianceModuleContract,
  tokenRemoveComplianceModule: tokenRemoveComplianceModuleContract,

  // Queries
  actions: tokenActionsContract,
  list: tokenListContract,
  read: tokenReadContract,
  events: tokenEventsContract,
  holders: tokenHoldersContract,

  // Stats
  statsAssets: tokenStatsAssetsContract,
  statsTransactions: tokenStatsTransactionsContract,
  statsValue: tokenStatsValueContract,
  statsAssetCount: tokenStatsAssetCountContract,
  statsTransactionCount: tokenStatsTransactionCountContract,
  statsTotalValue: tokenStatsTotalValueContract,
  statsSupplyDistribution: tokenStatsSupplyDistributionContract,
  statsActivityByAsset: tokenStatsActivityByAssetContract,
  statsTransactionHistory: tokenStatsTransactionHistoryContract,
};

// Extract mutation keys for permissions
export type TokenContractMutations =
  | "burn"
  | "create"
  | "mint"
  | "pause"
  | "tokenAddComplianceModule"
  | "tokenApprove"
  | "tokenForcedRecover"
  | "tokenFreezeAddress"
  | "tokenRecoverERC20"
  | "tokenRecoverTokens"
  | "tokenRedeem"
  | "tokenRemoveComplianceModule"
  | "tokenSetCap"
  | "tokenSetYieldSchedule"
  | "transfer"
  | "unpause";
