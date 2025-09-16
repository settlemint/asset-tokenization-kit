import { ethereumHash } from "@atk/zod/ethereum-hash";
import { ethereumHex } from "@atk/zod/ethereum-hex";
import { z } from "zod";

/**
 * Schema for compliance module parameters that can be configured
 */
export const ComplianceModuleParametersSchema = z.object({
  addresses: z.array(ethereumHash).default([]),
  countries: z.array(z.int()).default([]),
});

/**
 * Schema for global compliance module configuration
 */
export const GlobalComplianceModuleConfigSchema = z.object({
  id: ethereumHex,
  parameters: ComplianceModuleParametersSchema,
});

export type ComplianceModuleParameters = z.infer<
  typeof ComplianceModuleParametersSchema
>;
export type GlobalComplianceModuleConfig = z.infer<
  typeof GlobalComplianceModuleConfigSchema
>;
