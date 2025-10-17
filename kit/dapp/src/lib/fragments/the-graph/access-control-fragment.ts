import { theGraphGraphql } from "@/lib/settlemint/the-graph";

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
    id
    addonManager { id isContract }
    addonModule { id isContract }
    addonRegistryModule { id isContract }
    admin { id isContract }
    auditor { id isContract }
    burner { id isContract }
    capManagement { id isContract }
    claimPolicyManager { id isContract }
    claimIssuer { id isContract }
    complianceAdmin { id isContract }
    complianceManager { id isContract }
    custodian { id isContract }
    emergency { id isContract }
    forcedTransfer { id isContract }
    freezer { id isContract }
    fundsManager { id isContract }
    governance { id isContract }
    identityManager { id isContract }
    identityRegistryModule { id isContract }
    minter { id isContract }
    organisationIdentityManager { id isContract }
    pauser { id isContract }
    recovery { id isContract }
    saleAdmin { id isContract }
    signer { id isContract }
    supplyManagement { id isContract }
    systemManager { id isContract }
    systemModule { id isContract }
    tokenAdmin { id isContract }
    tokenFactoryModule { id isContract }
    tokenFactoryRegistryModule { id isContract }
    tokenManager { id isContract }
    trustedIssuersMetaRegistryModule { id isContract }
    verificationAdmin { id isContract }
    roleAdmins {
      id
      role
      roleFieldName
      adminRole
      adminFieldName
    }
  }
`);
