import { z } from "zod";
import { accountArray } from "./account";
import { ethereumAddress } from "./ethereum-address";

export const roles = [
  "addonManager",
  "addonModule",
  "addonRegistryModule",
  "admin",
  "auditor",
  "burner",
  "capManagement",
  "claimPolicyManager",
  "claimIssuer",
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
  "organisationIdentityManager",
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
  "trustedIssuersMetaRegistryModule",
  "verificationAdmin",
] as const;

export type AccessControlRoles = (typeof roles)[number];

/**
 * Zod schema for validating all possible access control roles.
 * Each property corresponds to a boolean indicating if the user has that role.
 * The keys must match the AccessControlRoles union type exactly.
 */
export const accessControlRoles = z.object(
  Object.fromEntries(roles.map((role) => [role, z.boolean().default(false)]))
);

/**
 * Zod schema for validating an access control role.
 * @remarks
 * This schema is used to validate the role of a user in the access control system.
 * It is used to ensure that the role is one of the possible roles defined in the AccessControlRoles union type.
 */
export const accessControlRole = z.enum(roles);

export type AccessControlRole = z.infer<typeof accessControlRole>;

export const assetAccessControlRoles: AccessControlRoles[] = [
  "custodian",
  "emergency",
  "governance",
  "supplyManagement",
  "tokenManager",
];
export const assetAccessControlRole = z.enum(assetAccessControlRoles);

/**
 * Creates a Zod schema that validates the AccessControl fragment structure from TheGraph.
 * @remarks
 * This schema matches the AccessControlFragment structure, where each role is represented
 * as a single Account object (not an array). This is used when validating access control
 * data from TheGraph queries that use the AccessControlFragment.
 * @returns A Zod object schema for AccessControl validation
 * @example
 * ```typescript
 * const schema = accessControlSchema();
 * const result = schema.parse({
 *   id: "0x123...",
 *   admin: { id: "0x456...", isContract: false },
 *   tokenManager: { id: "0x789...", isContract: true },
 *   // ... other roles as single Account objects
 * });
 * ```
 */
export const accessControlSchema = () =>
  z.object({
    id: ethereumAddress.describe("Access control contract address"),
    addonManager: accountArray().describe("Accounts with addon manager role"),
    addonModule: accountArray().describe("Accounts with addon module role"),
    addonRegistryModule: accountArray().describe(
      "Accounts with addon registry module role"
    ),
    admin: accountArray().describe("Accounts with admin role"),
    auditor: accountArray().describe("Accounts with auditor role"),
    burner: accountArray().describe("Accounts with burner role"),
    capManagement: accountArray().describe("Accounts with cap management role"),
    claimPolicyManager: accountArray().describe(
      "Accounts with claim policy manager role"
    ),
    claimIssuer: accountArray().describe("Accounts with claim issuer role"),
    complianceAdmin: accountArray().describe(
      "Accounts with compliance admin role"
    ),
    complianceManager: accountArray().describe(
      "Accounts with compliance manager role"
    ),
    custodian: accountArray().describe("Accounts with custodian role"),
    emergency: accountArray().describe("Accounts with emergency role"),
    forcedTransfer: accountArray().describe(
      "Accounts with forced transfer role"
    ),
    freezer: accountArray().describe("Accounts with freezer role"),
    fundsManager: accountArray().describe("Accounts with funds manager role"),
    globalListManager: accountArray().describe(
      "Accounts with global list manager role"
    ),
    governance: accountArray().describe("Accounts with governance role"),
    identityManager: accountArray().describe(
      "Accounts with identity manager role"
    ),
    identityRegistryModule: accountArray().describe(
      "Accounts with identity registry module role"
    ),
    minter: accountArray().describe("Accounts with minter role"),
    organisationIdentityManager: accountArray().describe(
      "Accounts with organisation identity manager role"
    ),
    pauser: accountArray().describe("Accounts with pauser role"),
    recovery: accountArray().describe("Accounts with recovery role"),
    saleAdmin: accountArray().describe("Accounts with sale admin role"),
    signer: accountArray().describe("Accounts with signer role"),
    supplyManagement: accountArray().describe(
      "Accounts with supply management role"
    ),
    systemManager: accountArray().describe("Accounts with system manager role"),
    systemModule: accountArray().describe("Accounts with system module role"),
    tokenAdmin: accountArray().describe("Accounts with token admin role"),
    tokenFactoryModule: accountArray().describe(
      "Accounts with token factory module role"
    ),
    tokenFactoryRegistryModule: accountArray().describe(
      "Accounts with token factory registry module role"
    ),
    tokenManager: accountArray().describe("Accounts with token manager role"),
    trustedIssuersMetaRegistryModule: accountArray().describe(
      "Accounts with trusted issuers meta registry module role"
    ),
    verificationAdmin: accountArray().describe(
      "Accounts with verification admin role"
    ),
  });

/**
 * Type inference for the AccessControl schema
 */
export type AccessControl = z.infer<ReturnType<typeof accessControlSchema>>;
