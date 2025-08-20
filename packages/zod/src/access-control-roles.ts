import { z } from "zod";

export const roles = [
  "addonManager",
  "addonModule",
  "addonRegistryModule",
  "admin",
  "auditor",
  "burner",
  "capManagement",
  "claimPolicyManager",
  "complianceAdmin",
  "complianceManager",
  "custodian",
  "emergency",
  "forcedTransfer",
  "freezer",
  "fundsManager",
  "globalListManager",
  "governance",
  "identityManager",
  "identityRegistryModule",
  "minter",
  "pauser",
  "recovery",
  "saleAdmin",
  "signer",
  "supplyManagement",
  "systemManager",
  "systemModule",
  "tokenAdmin",
  "tokenFactoryModule",
  "tokenFactoryRegistryModule",
  "tokenManager",
  "verificationAdmin",
] as const;

type AccessControlRoles = (typeof roles)[number];

/**
 * Zod schema for validating all possible access control roles.
 * Each property corresponds to a boolean indicating if the user has that role.
 * The keys must match the AccessControlRoles union type exactly.
 */
export const accessControlRoles = z.object(Object.fromEntries(roles.map((role) => [role, z.boolean().default(false)])));

/**
 * Zod schema for validating an access control role.
 * @remarks
 * This schema is used to validate the role of a user in the access control system.
 * It is used to ensure that the role is one of the possible roles defined in the AccessControlRoles union type.
 */
export const accessControlRole = z.enum(roles);

export const assetAccessControlRoles: AccessControlRoles[] = [
  "governance",
  "supplyManagement",
  "custodian",
  "emergency",
];

export const assetAccessControlRole = z.enum(assetAccessControlRoles);
