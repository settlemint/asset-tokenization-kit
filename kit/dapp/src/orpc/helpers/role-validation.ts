import type {
  AccessControl,
  AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";

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
    addonModule: false,
    addonRegistryModule: false,
    admin: false,
    auditor: false,
    bypassListManager: false,
    bypassListManagerAdmin: false,
    claimManager: false,
    custodian: false,
    deployer: false,
    emergency: false,
    fundsManager: false,
    globalListManager: false,
    governance: false,
    identityRegistryModule: false,
    implementationManager: false,
    registrar: false,
    registrarAdmin: false,
    registryManager: false,
    saleAdmin: false,
    signer: false,
    storageModifier: false,
    supplyManagement: false,
    systemModule: false,
    tokenFactoryModule: false,
    tokenFactoryRegistryModule: false,
  };

  const userRoles = Object.entries(accessControl ?? {}).reduce<
    Record<AccessControlRoles, boolean>
  >((acc, [role, accounts]) => {
    const userHasRole = accounts.some((account) => account.id === wallet);
    acc[role as AccessControlRoles] = userHasRole;
    return acc;
  }, initialUserRoles);

  return userRoles;
}
