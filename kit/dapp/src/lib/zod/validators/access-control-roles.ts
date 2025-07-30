import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { z } from "zod";

/**
 * Zod schema for validating all possible access control roles.
 * Each property corresponds to a boolean indicating if the user has that role.
 * The keys must match the AccessControlRoles union type exactly.
 */
export const accessControlRoles: z.ZodType<
  Record<AccessControlRoles, boolean>
> = z.object({
  addonModule: z.boolean().default(false),
  addonRegistryModule: z.boolean().default(false),
  admin: z.boolean().default(false),
  auditor: z.boolean().default(false),
  bypassListManager: z.boolean().default(false),
  bypassListManagerAdmin: z.boolean().default(false),
  claimManager: z.boolean().default(false),
  custodian: z.boolean().default(false),
  deployer: z.boolean().default(false),
  emergency: z.boolean().default(false),
  fundsManager: z.boolean().default(false),
  globalListManager: z.boolean().default(false),
  governance: z.boolean().default(false),
  identityRegistryModule: z.boolean().default(false),
  implementationManager: z.boolean().default(false),
  registrar: z.boolean().default(false),
  registrarAdmin: z.boolean().default(false),
  registryManager: z.boolean().default(false),
  saleAdmin: z.boolean().default(false),
  signer: z.boolean().default(false),
  storageModifier: z.boolean().default(false),
  supplyManagement: z.boolean().default(false),
  systemModule: z.boolean().default(false),
  tokenFactoryModule: z.boolean().default(false),
  tokenFactoryRegistryModule: z.boolean().default(false),
});
