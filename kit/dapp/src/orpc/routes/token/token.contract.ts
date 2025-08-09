// Mutation contracts
import { tokenGrantRoleContract } from "@/orpc/routes/token/routes/mutations/access/token.grant-role.contract";
import { tokenRevokeRoleContract } from "@/orpc/routes/token/routes/mutations/access/token.revoke-role.contract";
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
import { tokenSearchContract } from "@/orpc/routes/token/routes/token.search.contract";

// Stats contracts
import { statsBondStatusContract } from "@/orpc/routes/token/routes/stats/bond-status.contract";
import { statsCollateralRatioContract } from "@/orpc/routes/token/routes/stats/collateral-ratio.contract";
import { statsSupplyChangesContract } from "@/orpc/routes/token/routes/stats/supply-changes.contract";
import { statsTotalSupplyContract } from "@/orpc/routes/token/routes/stats/total-supply.contract";
import { statsVolumeContract } from "@/orpc/routes/token/routes/stats/volume.contract";
import { statsWalletDistributionContract } from "@/orpc/routes/token/routes/stats/wallet-distribution.contract";

export const tokenContract = {
  // Mutations
  create: tokenCreateContract,
  grantRole: tokenGrantRoleContract,
  revokeRole: tokenRevokeRoleContract,
  pause: tokenPauseContract,
  unpause: tokenUnpauseContract,
  mint: tokenMintContract,
  burn: tokenBurnContract,
  transfer: tokenTransferContract,
  approve: tokenApproveContract,
  redeem: tokenRedeemContract,
  freezeAddress: tokenFreezeAddressContract,
  recoverTokens: tokenRecoverTokensContract,
  forcedRecover: tokenForcedRecoverContract,
  recoverERC20: tokenRecoverERC20Contract,
  setCap: tokenSetCapContract,
  setYieldSchedule: tokenSetYieldScheduleContract,
  addComplianceModule: tokenAddComplianceModuleContract,
  removeComplianceModule: tokenRemoveComplianceModuleContract,

  // Queries
  actions: tokenActionsContract,
  list: tokenListContract,
  read: tokenReadContract,
  search: tokenSearchContract,
  events: tokenEventsContract,
  holders: tokenHoldersContract,

  // Stats
  statsBondStatus: statsBondStatusContract,
  statsCollateralRatio: statsCollateralRatioContract,
  statsTotalSupply: statsTotalSupplyContract,
  statsSupplyChanges: statsSupplyChangesContract,
  statsVolume: statsVolumeContract,
  statsWalletDistribution: statsWalletDistributionContract,
};

// Extract mutation keys for permissions
export type TokenContractMutations =
  | "burn"
  | "create"
  | "grantRole"
  | "revokeRole"
  | "mint"
  | "pause"
  | "addComplianceModule"
  | "approve"
  | "forcedRecover"
  | "freezeAddress"
  | "recoverERC20"
  | "recoverTokens"
  | "redeem"
  | "removeComplianceModule"
  | "setCap"
  | "setYieldSchedule"
  | "transfer"
  | "unpause";
