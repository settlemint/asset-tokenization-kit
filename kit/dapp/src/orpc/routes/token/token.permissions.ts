import { ClaimTopic } from "@/orpc/helpers/claims/create-claim";
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
  updateCollateral: { any: [] }, // No token role required – gated via trusted issuer registry
  freezePartial: "custodian",
  unfreezePartial: "custodian",
};

/**
 * Additional permission requirements that are not role based.
 *
 * @description
 * Certain token actions rely on trusted issuer authorization instead of the
 * token's access control roles. These actions require the caller to be
 * registered as a trusted issuer for specific claim topics in the identity
 * registry. The trusted issuer middleware performs the runtime enforcement.
 */
export const TOKEN_TRUSTED_ISSUER_REQUIREMENTS: Partial<
  Record<TokenAccessManagedMutations, ClaimTopic[]>
> = {
  updateCollateral: [ClaimTopic.collateral],
};
