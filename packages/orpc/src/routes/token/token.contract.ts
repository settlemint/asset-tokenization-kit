// Mutation contracts
import { tokenGrantRoleContract } from "./routes/mutations/access/token.grant-role.contract";
import { tokenRevokeRoleContract } from "./routes/mutations/access/token.revoke-role.contract";
import { tokenApproveContract } from "./routes/mutations/approve/token.approve.contract";
import { tokenBurnContract } from "./routes/mutations/burn/token.burn.contract";
import { tokenSetCapContract } from "./routes/mutations/cap/token.set-cap.contract";
import { tokenAddComplianceModuleContract } from "./routes/mutations/compliance/token.add-compliance-module.contract";
import { tokenRemoveComplianceModuleContract } from "./routes/mutations/compliance/token.remove-compliance-module.contract";
import { tokenCreateContract } from "./routes/mutations/create/token.create.contract";
import { tokenFreezeAddressContract } from "./routes/mutations/freeze/token.freeze-address.contract";
import { tokenMintContract } from "./routes/mutations/mint/token.mint.contract";
import { tokenPauseContract } from "./routes/mutations/pause/token.pause.contract";
import { tokenUnpauseContract } from "./routes/mutations/pause/token.unpause.contract";
import { tokenForcedRecoverContract } from "./routes/mutations/recovery/token.forced-recover.contract";
import { tokenRecoverERC20Contract } from "./routes/mutations/recovery/token.recover-erc20.contract";
import { tokenRecoverTokensContract } from "./routes/mutations/recovery/token.recover-tokens.contract";
import { tokenRedeemContract } from "./routes/mutations/redeem/token.redeem.contract";
import { tokenTransferContract } from "./routes/mutations/transfer/token.transfer.contract";
import { tokenSetYieldScheduleContract } from "./routes/mutations/yield/token.set-yield-schedule.contract";
// Stats contracts
import { statsBondStatusContract } from "./routes/stats/bond-status.contract";
import { statsCollateralRatioContract } from "./routes/stats/collateral-ratio.contract";
import { statsSupplyChangesContract } from "./routes/stats/supply-changes.contract";
import { statsTotalSupplyContract } from "./routes/stats/total-supply.contract";
import { statsVolumeContract } from "./routes/stats/volume.contract";
import { statsWalletDistributionContract } from "./routes/stats/wallet-distribution.contract";
// Query contracts
import { tokenActionsContract } from "./routes/token.actions.contract";
import { tokenEventsContract } from "./routes/token.events.contract";
import { tokenHoldersContract } from "./routes/token.holders.contract";
import { tokenListContract } from "./routes/token.list.contract";
import { tokenReadContract } from "./routes/token.read.contract";
import { tokenSearchContract } from "./routes/token.search.contract";

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
