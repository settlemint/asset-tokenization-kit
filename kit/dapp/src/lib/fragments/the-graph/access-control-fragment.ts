import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { ResultOf } from "@settlemint/sdk-thegraph";

/**
 * The roles of the access control system
 */
export type AccessControlRoles = keyof NonNullable<
  NonNullable<ResultOf<typeof AccessControlFragment>>
>;

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
