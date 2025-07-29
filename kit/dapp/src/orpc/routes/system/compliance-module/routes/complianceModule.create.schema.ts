import { z } from "zod";
import { MutationInputSchemaWithContract } from "../../../common/schemas/mutation.schema";

/**
 * Supported system compliance module types enum
 */
export const SystemComplianceModuleTypeEnum = z.enum([
  "identity-verification",
  "country-allow-list",
  "country-block-list",
  "address-block-list",
  "identity-block-list",
  "identity-allow-list",
]);

/**
 * System compliance module type
 */
export type SystemComplianceModuleType = z.infer<
  typeof SystemComplianceModuleTypeEnum
>;

/**
 * Default implementation addresses for each compliance module type
 */
const DEFAULT_COMPLIANCE_MODULE_IMPLEMENTATIONS: Record<
  SystemComplianceModuleType,
  string
> = {
  "identity-verification": "0x5e771e1417100000000000000000000000020100",
  "country-allow-list": "0x5e771e1417100000000000000000000000020101",
  "country-block-list": "0x5e771e1417100000000000000000000000020102",
  "address-block-list": "0x5e771e1417100000000000000000000000020103",
  "identity-block-list": "0x5e771e1417100000000000000000000000020104",
  "identity-allow-list": "0x5e771e1417100000000000000000000000020105",
} as const;

/**
 * Get default implementation addresses for a compliance module type
 */
export function getDefaultComplianceModuleImplementations(
  type: SystemComplianceModuleType
) {
  return DEFAULT_COMPLIANCE_MODULE_IMPLEMENTATIONS[type];
}

/**
 * Individual compliance module configuration schema
 */
const SystemComplianceModuleConfigSchema = z.object({
  type: SystemComplianceModuleTypeEnum,
  // Optional implementation addresses for custom deployments
  implementations: z
    .record(z.string(), z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .optional(),
});

/**
 * Input schema for system compliance module creation
 */
export const SystemComplianceModuleCreateSchema =
  MutationInputSchemaWithContract.extend({
    complianceModules: z.union([
      SystemComplianceModuleConfigSchema,
      z.array(SystemComplianceModuleConfigSchema),
    ]),
  });

/**
 * Schema for individual compliance module result in streaming output
 */
const ComplianceModuleResultSchema = z.object({
  type: SystemComplianceModuleTypeEnum,

  proxyAddress: z.string().optional(),
  transactionHash: z.string().optional(),
  error: z.string().optional(),
  implementations: z.record(z.string(), z.string()).optional(),
});

/**
 * Output schema for streaming events during compliance module registration
 */
export const SystemComplianceModuleCreateOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed", "completed"]),
  message: z.string(),
  currentComplianceModule: ComplianceModuleResultSchema.optional(),
  results: z.array(ComplianceModuleResultSchema).optional(),
  result: z.array(ComplianceModuleResultSchema).optional(), // For useStreamingMutation compatibility
  progress: z
    .object({
      current: z.number(),
      total: z.number(),
    })
    .optional(),
});

/**
 * Type definitions
 */
export type SystemComplianceModuleCreateInput = z.infer<
  typeof SystemComplianceModuleCreateSchema
>;
export type SystemComplianceModuleCreateOutput = z.infer<
  typeof SystemComplianceModuleCreateOutputSchema
>;
export type SystemComplianceModuleConfig = z.infer<
  typeof SystemComplianceModuleConfigSchema
>;
export type ComplianceModuleResult = z.infer<
  typeof ComplianceModuleResultSchema
>;
