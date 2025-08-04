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
 * Contains the roles and permissions for the access control system. This fragment is the single source of truth for roles in the frontend.
 * It has been updated to remove legacy roles (e.g., deployer, registrar) that are no longer present in the GraphQL schema.
 * The permissions for these legacy roles have been mapped to other roles like 'tokenManager'.
 * It is critical that all authorization checks in the application use the roles defined here.
 */
export const AccessControlFragment = theGraphGraphql(`
  fragment AccessControlFragment on AccessControl {
    addonManager { id }
    addonModule { id }
    addonRegistryModule { id }
    admin { id }
    auditor { id }
    burner { id }
    capManagement { id }
    claimPolicyManager { id }
    complianceAdmin { id }
    complianceManager { id }
    custodian { id }
    emergency { id }
    forcedTransfer { id }
    freezer { id }
    fundsManager { id }
    globalListManager { id }
    governance { id }
    identityManager { id }
    identityRegistryModule { id }
    minter { id }
    pauser { id }
    recovery { id }
    saleAdmin { id }
    signer { id }
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
