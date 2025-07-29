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

import { factoryPredictAddressContract } from "@/orpc/routes/token/routes/factory/factory.predict-address.contract";

// Stats contracts - unified structure
import {
  activityContract,
  assetActivityContract,
} from "@/orpc/routes/token/routes/stats/activity.contract";
import { assetsContract } from "@/orpc/routes/token/routes/stats/assets.contract";
import { supplyDistributionContract } from "@/orpc/routes/token/routes/stats/supply-distribution.contract";
import {
  assetTransactionsContract,
  transactionsContract,
} from "@/orpc/routes/token/routes/stats/transactions.contract";
import {
  totalValueContract,
  valueContract,
} from "@/orpc/routes/token/routes/stats/value.contract";
import { assetVolumeContract } from "@/orpc/routes/token/routes/stats/volume.contract";

const tokenContractMutations = {
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
} as const;

export type TokenContractMutations = keyof typeof tokenContractMutations;

export const tokenContract = {
  // Factory
  factoryCreate: factoryCreateContract,
  factoryList: factoryListContract,
  factoryRead: factoryReadContract,
  factoryPredictAddress: factoryPredictAddressContract,

  // Mutations
  ...tokenContractMutations,

  // Queries
  actions: tokenActionsContract,
  list: tokenListContract,
  read: tokenReadContract,
  events: tokenEventsContract,
  holders: tokenHoldersContract,

  // System-wide stats (unified /stats/* routes)
  statsActivity: activityContract,
  statsTransactions: transactionsContract,
  statsValue: valueContract,
  statsTotalValue: totalValueContract,
  statsAssets: assetsContract,
  statsSupplyDistribution: supplyDistributionContract,

  // Asset-specific stats (unified /stats/{address}/* routes)
  statsAssetActivity: assetActivityContract,
  statsAssetTransactions: assetTransactionsContract,
  statsAssetVolume: assetVolumeContract,
};
