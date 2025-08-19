import {
  ComplianceModulePairInputArray,
  ComplianceTypeId,
} from "@/lib/zod/validators/compliance";

/**
 * Helper function to check if a compliance module type is enabled
 * Pure function defined outside component to avoid re-creation on each render
 */
export const isModuleEnabled = (
  typeId: ComplianceTypeId,
  modules: ComplianceModulePairInputArray
): boolean => {
  return !!modules?.find((m) => m.typeId === typeId);
};

/**
 * Helper function to get configuration for a specific compliance module type
 * Returns undefined if the module type is not found in the modules array
 */
export const getModuleConfig = (
  typeId: ComplianceTypeId,
  modules: ComplianceModulePairInputArray
) => {
  return modules?.find((m) => m.typeId === typeId);
};
