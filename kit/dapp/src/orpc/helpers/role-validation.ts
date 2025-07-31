import type {
  AccessControl,
  AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getAccessControlEntries } from "./access-control-helpers";

/**
 * Maps the user roles from the access control fragment
 * @param wallet - The wallet address of the user
 * @param accessControl - The access control fragment
 * @returns The user roles
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
    bypassListManager: false,
    bypassListManagerAdmin: false,
    capManagement: false,
    claimManager: false,
    claimPolicyManager: false,
    complianceAdmin: false,
    complianceManager: false,
    custodian: false,
    deployer: false,
    emergency: false,
    forcedTransfer: false,
    freezer: false,
    fundsManager: false,
    globalListManager: false,
    governance: false,
    identityManager: false,
    identityRegistryModule: false,
    implementationManager: false,
    minter: false,
    pauser: false,
    recovery: false,
    registrar: false,
    registrarAdmin: false,
    registryManager: false,
    saleAdmin: false,
    signer: false,
    storageModifier: false,
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
