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
    admin { id }
    auditor { id }
    addonModule { id }
    addonRegistryModule { id }
    bypassListManager { id }
    bypassListManagerAdmin { id }
    claimManager { id }
    custodian { id }
    deployer { id }
    emergency { id }
    fundsManager { id }
    globalListManager { id }
    governance { id }
    implementationManager { id }
    identityRegistryModule { id }
    registrar { id }
    registrarAdmin { id }
    registryManager { id }
    saleAdmin { id }
    signer { id }
    storageModifier { id }
    supplyManagement { id }
    systemModule { id }
    tokenFactoryModule { id }
    tokenFactoryRegistryModule { id }
  }
`);
