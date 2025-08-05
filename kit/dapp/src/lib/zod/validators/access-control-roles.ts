import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { z } from "zod";

/**
 * Zod schema for validating all possible access control roles.
 * Each property corresponds to a boolean indicating if the user has that role.
 * The keys must match the AccessControlRoles union type exactly.
 */
export const accessControlRoles: z.ZodObject<
  Record<AccessControlRoles, z.ZodDefault<z.ZodBoolean>>
> = z.object({
  addonManager: z.boolean().default(false),
  addonModule: z.boolean().default(false),
  addonRegistryModule: z.boolean().default(false),
  admin: z.boolean().default(false),
  auditor: z.boolean().default(false),
  burner: z.boolean().default(false),
  capManagement: z.boolean().default(false),
  claimPolicyManager: z.boolean().default(false),
  complianceAdmin: z.boolean().default(false),
  complianceManager: z.boolean().default(false),
  custodian: z.boolean().default(false),
  emergency: z.boolean().default(false),
  forcedTransfer: z.boolean().default(false),
  freezer: z.boolean().default(false),
  fundsManager: z.boolean().default(false),
  globalListManager: z.boolean().default(false),
  governance: z.boolean().default(false),
  identityManager: z.boolean().default(false),
  identityRegistryModule: z.boolean().default(false),
  minter: z.boolean().default(false),
  pauser: z.boolean().default(false),
  recovery: z.boolean().default(false),
  saleAdmin: z.boolean().default(false),
  signer: z.boolean().default(false),
  supplyManagement: z.boolean().default(false),
  systemManager: z.boolean().default(false),
  systemModule: z.boolean().default(false),
  tokenAdmin: z.boolean().default(false),
  tokenFactoryModule: z.boolean().default(false),
  tokenFactoryRegistryModule: z.boolean().default(false),
  tokenManager: z.boolean().default(false),
  verificationAdmin: z.boolean().default(false),
});

/**
 * Zod schema for validating an access control role.
 * @remarks
 * This schema is used to validate the role of a user in the access control system.
 * It is used to ensure that the role is one of the possible roles defined in the AccessControlRoles union type.
 */
export const accessControlRole = z.enum(
  Object.keys(accessControlRoles.shape) as AccessControlRoles[]
);
