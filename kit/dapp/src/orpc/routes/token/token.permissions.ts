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
  mint: ["supplyManagement"],
  pause: ["emergency"],
  addComplianceModule: ["governance"],
  approve: [],
  forcedRecover: ["custodian"],
  freezeAddress: ["custodian"],
  recoverERC20: ["emergency"],
  recoverTokens: ["emergency"],
  redeem: ["supplyManagement"],
  removeComplianceModule: ["governance"],
  setCap: ["supplyManagement"],
  setYieldSchedule: ["governance"],
  transfer: [], // TODO: requires custodian on a forced transfer (would generate a dedicated endpoint )
  unpause: ["emergency"],
};
