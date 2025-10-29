import type { TokenAccessManagedMutations } from "@/orpc/routes/token/token.contract";
import type { RoleRequirement } from "@atk/zod/role-requirement";

/**
 * The permissions for the token contract
 *
 * @description
 * This is a mapping of the token contract methods to the roles that are required to call them.
 * Supports complex AND/OR logic for role requirements.
 */
export const TOKEN_PERMISSIONS: Record<
  TokenAccessManagedMutations,
  RoleRequirement
> = {
  burn: "supplyManagement",
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
  redeem: { any: [] }, // No roles required
  mature: "governance",
  removeComplianceModule: "governance",
  setCap: "supplyManagement",
  setYieldSchedule: "governance",
  topUpDenominationAsset: { any: [] }, // Is like a transfer from your own wallet
  withdrawDenominationAsset: "supplyManagement",
  transfer: { any: [] },
  forcedTransfer: "custodian",
  unpause: "emergency",
  updateCollateral: { any: [] }, // No roles required (requires to be a trusted issuer of the collateral claim)
  freezePartial: "custodian",
  unfreezePartial: "custodian",
};
