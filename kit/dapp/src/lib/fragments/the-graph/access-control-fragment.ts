import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { FragmentOf, ResultOf } from "@settlemint/sdk-thegraph";

/**
 * The roles of the access control system
 */
export type AccessControlRoles = keyof NonNullable<
  NonNullable<ResultOf<typeof AccessControlFragment>>
>;

/**
 * The access control data from The Graph
 */
export type AccessControl = FragmentOf<typeof AccessControlFragment>;

/**
 * GraphQL fragment for access control data from The Graph
 * @remarks
 * Contains the roles and permissions for the access control system
 */
export const AccessControlFragment = theGraphGraphql(`
  fragment AccessControlFragment on AccessControl {
    addonManager { id }
    addonModule { id }
    addonRegistryModule { id }
    admin { id }
    auditor { id }
    burner { id }
    bypassListManager { id }
    bypassListManagerAdmin { id }
    capManagement { id }
    claimManager { id }
    claimPolicyManager { id }
    complianceAdmin { id }
    complianceManager { id }
    custodian { id }
    deployer { id }
    emergency { id }
    forcedTransfer { id }
    freezer { id }
    fundsManager { id }
    globalListManager { id }
    governance { id }
    identityManager { id }
    identityRegistryModule { id }
    implementationManager { id }
    minter { id }
    pauser { id }
    recovery { id }
    registrar { id }
    registrarAdmin { id }
    registryManager { id }
    saleAdmin { id }
    signer { id }
    storageModifier { id }
    supplyManagement { id }
    systemManager { id }
    systemModule { id }
    tokenAdmin { id }
    tokenFactoryModule { id }
    tokenFactoryRegistryModule { id }
    tokenManager { id }
    verificationAdmin { id }
  }
`);
