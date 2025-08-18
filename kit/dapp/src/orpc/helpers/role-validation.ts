import type {
  AccessControl,
  AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";
import { getAccessControlEntries } from "./access-control-helpers";

/**
 * Maps the user roles from the access control fragment
 * @param wallet - The wallet address of the user
 * @param accessControl - The access control fragment
 * @returns The user roles
 * @remarks
 * This function maps roles based on the current GraphQL schema, which is the single source of truth for roles.
 * Legacy roles (e.g., 'deployer', 'registrar') have been removed from the schema and their permissions remapped.
 * Consuming code must ensure that access control checks use the new, correct roles defined in the schema
 * to avoid potential security vulnerabilities like permission gaps or privilege escalations.
 */
export function mapUserRoles(
  wallet: EthereumAddress,
  accessControl: AccessControl | null
) {
  // Initialize with all roles set to false
  const initialUserRoles: Record<AccessControlRoles, boolean> = {
    addonManager: false,
    addonModule: false,
    addonRegistryModule: false,
    admin: false,
    auditor: false,
    burner: false,
    capManagement: false,
    claimPolicyManager: false,
    complianceAdmin: false,
    complianceManager: false,
    custodian: false,
    emergency: false,
    forcedTransfer: false,
    freezer: false,
    fundsManager: false,
    globalListManager: false,
    governance: false,
    identityManager: false,
    identityRegistryModule: false,
    minter: false,
    pauser: false,
    recovery: false,
    saleAdmin: false,
    signer: false,
    supplyManagement: false,
    systemManager: false,
    systemModule: false,
    tokenAdmin: false,
    tokenFactoryModule: false,
    tokenFactoryRegistryModule: false,
    tokenManager: false,
    verificationAdmin: false,
  };

  // Use type-safe helper to get access control entries
  const userRoles = getAccessControlEntries(accessControl).reduce<
    Record<AccessControlRoles, boolean>
  >((acc, [role, accounts]) => {
    const userHasRole = accounts.some(
      (account) => account.id.toLowerCase() === wallet.toLowerCase()
    );
    acc[role] = userHasRole;
    return acc;
  }, initialUserRoles);

  return userRoles;
}
