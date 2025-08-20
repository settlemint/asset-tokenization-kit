/**
 * Compliance Module Detail Router Component
 *
 * @fileoverview
 * Central routing component that dynamically renders type-specific compliance module
 * detail views. Uses TypeScript's advanced type system with discriminated unions and
 * generic type narrowing to ensure compile-time safety across all compliance module types.
 *
 * @remarks
 * DESIGN DECISIONS:
 * - Switch-based routing for O(1) lookup performance vs map-based approaches
 * - Generic type narrowing eliminates runtime type assertions and casting
 * - Props spreading pattern reduces boilerplate while maintaining type safety
 * - Centralized routing keeps module-specific components decoupled
 *
 * TRADEOFF: Bundle size vs performance - imports all compliance detail components
 * upfront rather than lazy loading, chosen for better UX in compliance workflows
 * where users frequently switch between module types.
 */

import { AddressBlocklistModuleDetail } from "@/components/compliance/details/address/address-blocklist-module-detail";
import { CountryAllowlistModuleDetail } from "@/components/compliance/details/country/country-allowlist-module-detail";
import { CountryBlocklistModuleDetail } from "@/components/compliance/details/country/country-blocklist-module-detail";
import { IdentityAllowlistModuleDetail } from "@/components/compliance/details/identity/identity-allowlist-module-detail";
import { IdentityBlocklistModuleDetail } from "@/components/compliance/details/identity/identity-blocklist-module-detail";
import { IdentityRestrictionModuleDetail } from "@/components/compliance/details/smart-identity/smart-identity-verification-module-detail";
import { getModuleConfig, isModuleEnabled } from "@/lib/compliance/utils";
import {
  type ComplianceModulePairInput,
  type ComplianceModulePairInputArray,
  type ComplianceParams,
  type ComplianceTypeId,
  ComplianceTypeIdEnum,
} from "@atk/zod/compliance";
import type { Address } from "viem";

/**
 * Props for the ComplianceModuleDetail router component.
 *
 * @remarks
 * DESIGN: Interface over type alias chosen for better IDE experience and
 * clearer error messages when prop validation fails.
 *
 * TYPE SAFETY: activeModule structure ensures typeId and module address
 * are always paired correctly, preventing mismatched module configurations.
 */
interface ComplianceModuleDetailProps {
  /** Currently selected compliance module with type and contract address */
  activeModule: {
    typeId: ComplianceTypeId;
    module: Address;
  };
  /** Array of currently enabled compliance modules with their configurations */
  enabledModules: ComplianceModulePairInputArray;
  /** Callback invoked when user enables a compliance module with encoded parameters */
  onEnable: (modulePair: ComplianceModulePairInput) => void;
  /** Callback invoked when user disables a compliance module with encoded parameters */
  onDisable: (modulePair: ComplianceModulePairInput) => void;
  /** Callback to close the detail view and return to module grid */
  onClose: () => void;
}

/**
 * Dynamic compliance module detail router component.
 *
 * @remarks
 * ARCHITECTURE: Router pattern isolates module-specific rendering logic from
 * common state management, enabling independent evolution of compliance modules.
 *
 * PERFORMANCE: Switch statement provides O(1) module lookup vs O(n) array-based
 * approaches, critical for responsive UX when users navigate between modules.
 *
 * @param props - Component props with active module and callback handlers
 * @returns Type-specific compliance module detail component
 */
export function ComplianceModuleDetail({
  activeModule,
  enabledModules,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps) {
  // PERF: Early computation of enable state prevents redundant checks in child components
  const isEnabled = isModuleEnabled(activeModule.typeId, enabledModules);

  // WHY: Props object extracted to reduce prop drilling and enable consistent interfaces
  // across all module detail components while maintaining type safety
  const complianceDetailProps = {
    module: activeModule.module,
    isEnabled,
    onEnable,
    onDisable,
    onClose,
  };

  /**
   * Type-safe configuration retrieval with discriminated union narrowing.
   *
   * @remarks
   * TYPE SAFETY: Generic constraint <T extends ComplianceTypeId> ensures return type
   * matches the requested typeId exactly. Extract<ComplianceParams, { typeId: T }>
   * uses TypeScript's discriminated union to narrow the return type to the specific
   * parameter shape for the requested compliance module type.
   *
   * INVARIANT: Returns undefined for disabled modules to prevent form initialization
   * with stale configuration data from previous enable/disable cycles.
   *
   * @template T - Specific ComplianceTypeId being requested
   * @param typeId - The compliance module typeId to retrieve configuration for
   * @returns Strongly-typed configuration object or undefined if module disabled
   */
  const getInitialValues = <T extends ComplianceTypeId>(
    typeId: T
  ): Extract<ComplianceParams, { typeId: T }> | undefined => {
    // EDGE CASE: Disabled modules should not provide initial values to prevent
    // form hydration with outdated parameters
    if (!isEnabled) return undefined;
    const config = getModuleConfig(typeId, enabledModules);
    // TYPE NARROWING: Runtime typeId check ensures type assertion safety
    return config?.typeId === typeId
      ? (config as Extract<ComplianceParams, { typeId: T }>)
      : undefined;
  };

  // PERFORMANCE: Switch statement enables tree-shaking and ensures only the required
  // component is instantiated, reducing memory allocation and render overhead
  switch (activeModule.typeId) {
    case ComplianceTypeIdEnum.AddressBlockListComplianceModule:
      return (
        <AddressBlocklistModuleDetail
          typeId="AddressBlockListComplianceModule"
          initialValues={getInitialValues("AddressBlockListComplianceModule")}
          {...complianceDetailProps}
        />
      );
    case ComplianceTypeIdEnum.CountryAllowListComplianceModule:
      return (
        <CountryAllowlistModuleDetail
          typeId="CountryAllowListComplianceModule"
          initialValues={getInitialValues("CountryAllowListComplianceModule")}
          {...complianceDetailProps}
        />
      );
    case ComplianceTypeIdEnum.CountryBlockListComplianceModule:
      return (
        <CountryBlocklistModuleDetail
          typeId="CountryBlockListComplianceModule"
          initialValues={getInitialValues("CountryBlockListComplianceModule")}
          {...complianceDetailProps}
        />
      );
    case ComplianceTypeIdEnum.IdentityAllowListComplianceModule:
      return (
        <IdentityAllowlistModuleDetail
          typeId="IdentityAllowListComplianceModule"
          initialValues={getInitialValues("IdentityAllowListComplianceModule")}
          {...complianceDetailProps}
        />
      );
    case ComplianceTypeIdEnum.IdentityBlockListComplianceModule:
      return (
        <IdentityBlocklistModuleDetail
          typeId="IdentityBlockListComplianceModule"
          initialValues={getInitialValues("IdentityBlockListComplianceModule")}
          {...complianceDetailProps}
        />
      );
    case ComplianceTypeIdEnum.SMARTIdentityVerificationComplianceModule:
      return (
        <IdentityRestrictionModuleDetail
          typeId="SMARTIdentityVerificationComplianceModule"
          initialValues={getInitialValues(
            "SMARTIdentityVerificationComplianceModule"
          )}
          {...complianceDetailProps}
        />
      );
    default:
      // INVARIANT: Should never reach here due to ComplianceTypeId enum constraint,
      // but provides fallback for defensive programming
      return null;
  }
}
