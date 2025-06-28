import { theGraphGraphql } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for access control data from The Graph
 * @remarks
 * Contains the roles and permissions for the access control system
 */
export const AccessControlFragment = theGraphGraphql(`
  fragment AccessControlFragment on AccessControl {
    admin { id }
    registrar { id }
    claimManager { id }
    deployer { id }
    storageModifier { id }
    registryManager { id }
    governance { id }
    supplyManagement { id }
    custodian { id }
    emergency { id }
    implementationManager { id }
    bypassListManager { id }
  }
`);
