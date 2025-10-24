import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { type ComplianceTypeId, complianceTypeId } from "@atk/zod/compliance";
import {
  ethereumAddress,
  type EthereumAddress,
} from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Default implementation addresses for each compliance module type
 */
const DEFAULT_COMPLIANCE_MODULE_IMPLEMENTATIONS: Record<
  ComplianceTypeId,
  EthereumAddress
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
  TokenSupplyLimitComplianceModule:
    "0x5e771e1417100000000000000000000000020106",
  InvestorCountComplianceModule: "0x5e771e1417100000000000000000000000020107",
  TimeLockComplianceModule: "0x5e771e1417100000000000000000000000020108",
  TransferApprovalComplianceModule:
    "0x5e771e1417100000000000000000000000020109",
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
  // Optional implementation address for custom deployment
  implementation: ethereumAddress.optional(),
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
