import { ethereumHash } from "@atk/zod/ethereum-hash";
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
const globalComplianceModuleId = z
  .string()
  .refine(
    (value) =>
      /^0x[a-fA-F0-9]+$/.test(value) &&
      (value.length === 66 || value.length === 82),
    {
      message:
        "Global compliance module id must be a 0x-prefixed hex string of 32 or 40 bytes",
    }
  );

export const GlobalComplianceModuleConfigSchema = z.object({
  id: globalComplianceModuleId,
  parameters: ComplianceModuleParametersSchema,
});

export type ComplianceModuleParameters = z.infer<
  typeof ComplianceModuleParametersSchema
>;
export type GlobalComplianceModuleConfig = z.infer<
  typeof GlobalComplianceModuleConfigSchema
>;
