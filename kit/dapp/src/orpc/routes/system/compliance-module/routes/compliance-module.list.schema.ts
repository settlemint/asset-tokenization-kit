import { complianceTypeId } from "@/lib/zod/validators/compliance";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";
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
