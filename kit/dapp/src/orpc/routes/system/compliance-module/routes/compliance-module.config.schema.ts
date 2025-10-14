import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumCompositeId } from "@atk/zod/ethereum-composite-id";
import * as z from "zod";

/**
 * Schema for compliance module parameters that can be configured
 */
export const ComplianceModuleParametersSchema = z.object({
  addresses: z.array(ethereumAddress).default([]),
  countries: z.array(z.int()).default([]),
});

/**
 * Schema for global compliance module configuration
 */
export const GlobalComplianceModuleConfigSchema = z.object({
  id: ethereumCompositeId,
  parameters: ComplianceModuleParametersSchema,
});

export type ComplianceModuleParameters = z.infer<
  typeof ComplianceModuleParametersSchema
>;
export type GlobalComplianceModuleConfig = z.infer<
  typeof GlobalComplianceModuleConfigSchema
>;
