import type { TokenContractMutations } from "@/orpc/routes/token/token.contract";
import type { RoleRequirement } from "@atk/zod/role-requirement";

/**
 * The permissions for the token contract
 *
 * @description
 * This is a mapping of the token contract methods to the roles that are required to call them.
 * Supports complex AND/OR logic for role requirements.
 */
export const TOKEN_PERMISSIONS: Record<
  TokenContractMutations,
  RoleRequirement
> = {
  burn: "supplyManagement",
  create: "tokenManager",
  grantRole: "admin",
  revokeRole: "admin",
  mint: "supplyManagement",
  pause: "emergency",
  addComplianceModule: "governance",
  approve: { any: [] }, // No roles required
  forcedRecover: "custodian",
  freezeAddress: "custodian",
  recoverERC20: "emergency",
  recoverTokens: "emergency",
  redeem: "supplyManagement",
  removeComplianceModule: "governance",
  setCap: "supplyManagement",
  setYieldSchedule: "governance",
  transfer: { any: [] }, // TODO: requires custodian on a forced transfer (would generate a dedicated endpoint )
  unpause: "emergency",
  updateCollateral: "governance",
  freezePartial: "custodian",
  unfreezePartial: "custodian",
};
