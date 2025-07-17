import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import type { TokenContractMutations } from "@/orpc/routes/token/token.contract";

/**
 * The permissions for the token contract
 *
 * @description
 * This is a mapping of the token contract methods to the roles that are required to call them.
 */
export const TOKEN_PERMISSIONS: Record<
  TokenContractMutations,
  AccessControlRoles[]
> = {
  burn: ["supplyManagement"],
  create: ["deployer"],
  factoryCreate: ["deployer"],
  mint: ["supplyManagement"],
  pause: ["emergency"],
  tokenAddComplianceModule: ["governance"],
  tokenApprove: [],
  tokenForcedRecover: ["custodian"],
  tokenFreezeAddress: ["custodian"],
  tokenRecoverERC20: ["emergency"],
  tokenRecoverTokens: ["emergency"],
  tokenRedeem: ["supplyManagement"],
  tokenRemoveComplianceModule: ["governance"],
  tokenSetCap: ["supplyManagement"],
  tokenSetYieldSchedule: ["governance"],
  transfer: [], // TODO: requires custodian on a forced transfer (would generate a dedicated endpoint )
  unpause: ["emergency"],
};
