import {
  ComplianceTypeId,
  complianceTypeId,
} from "@/lib/zod/validators/compliance";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

/**
 * Default implementation addresses for each compliance module type
 */
const DEFAULT_COMPLIANCE_MODULE_IMPLEMENTATIONS: Record<
  ComplianceTypeId,
  string
> = {
  SMARTIdentityVerificationComplianceModule:
    "0x5e771e1417100000000000000000000000020100",
  CountryAllowListComplianceModule:
    "0x5e771e1417100000000000000000000000020101",
  CountryBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020102",
  AddressBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020103",
  IdentityBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020104",
  IdentityAllowListComplianceModule:
    "0x5e771e1417100000000000000000000000020105",
} as const;

/**
 * Get default implementation addresses for a compliance module type
 */
export function getDefaultComplianceModuleImplementations(
  type: ComplianceTypeId
) {
  return DEFAULT_COMPLIANCE_MODULE_IMPLEMENTATIONS[type];
}

/**
 * Individual compliance module configuration schema
 */
const SystemComplianceModuleConfigSchema = z.object({
  type: complianceTypeId(),
  // Optional implementation addresses for custom deployments
  implementations: z
    .record(z.string(), z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .optional(),
});

/**
 * Input schema for system compliance module creation
 */
export const SystemComplianceModuleCreateSchema = MutationInputSchema.extend({
  complianceModules: z.union([
    z.literal("all").describe("Create all available compliance modules"),
    SystemComplianceModuleConfigSchema,
    z.array(SystemComplianceModuleConfigSchema),
  ]),
});

/**
 * Type definitions
 */
export type SystemComplianceModuleCreateInput = z.infer<
  typeof SystemComplianceModuleCreateSchema
>;
export type SystemComplianceModuleConfig = z.infer<
  typeof SystemComplianceModuleConfigSchema
>;
