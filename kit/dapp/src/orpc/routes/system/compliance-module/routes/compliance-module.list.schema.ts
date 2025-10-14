import { complianceTypeId } from "@atk/zod/compliance";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";
import { GlobalComplianceModuleConfigSchema } from "./compliance-module.config.schema";

/**
 * Schema for a compliance module returned by the list API
 */
export const ComplianceModuleSchema = z.object({
  id: ethereumAddress,
  typeId: complianceTypeId(),
  name: z.string(),
  globalConfigs: z.array(GlobalComplianceModuleConfigSchema).default([]),
});

/**
 * Schema for the compliance modules list output
 */
export const ComplianceModulesListOutputSchema = z.array(
  ComplianceModuleSchema
);

export type ComplianceModule = z.infer<typeof ComplianceModuleSchema>;
export type ComplianceModulesList = z.infer<
  typeof ComplianceModulesListOutputSchema
>;
