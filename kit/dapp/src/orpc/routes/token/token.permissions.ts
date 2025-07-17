import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import type { tokenContract } from "@/orpc/routes/token/token.contract";

/**
 * The permissions for the token contract
 *
 * @description
 * This is a mapping of the token contract methods to the roles that are required to call them.
 */
export const TOKEN_PERMISSIONS: Record<
  keyof typeof tokenContract,
  AccessControlRoles[]
> = {
  burn: ["supplyManagement"],
  create: [],
  events: [],
  factoryCreate: ["deployer"],
  factoryList: [],
  factoryRead: [],
  holders: [],
  list: [],
  mint: ["supplyManagement"],
  pause: ["deployer"],
  read: [],
  statsActivityByAsset: [],
  statsAssetCount: [],
  statsAssets: [],
  statsTotalValue: [],
  statsTransactionCount: [],
  statsTransactionHistory: [],
  statsTransactions: [],
  statsSupplyDistribution: [],
  statsValue: [],
  tokenAddComplianceModule: ["governance"],
  tokenApprove: [],
  tokenForcedRecover: ["supplyManagement"],
  tokenFreezeAddress: ["supplyManagement"],
  tokenRecoverERC20: ["supplyManagement"],
  tokenRecoverTokens: ["supplyManagement"],
  tokenRedeem: ["supplyManagement"],
  tokenRemoveComplianceModule: ["governance"],
  tokenSetCap: ["supplyManagement"],
  tokenSetYieldSchedule: ["supplyManagement"],
  transfer: [],
  unpause: ["deployer"],
};
