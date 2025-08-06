import { AddressBlocklistModuleDetail } from "@/components/compliance/details/address/address-blocklist-module-detail";
import { CountryAllowlistModuleDetail } from "@/components/compliance/details/country/country-allowlist-module-detail";
import { CountryBlocklistModuleDetail } from "@/components/compliance/details/country/country-blocklist-module-detail";
import { IdentityAllowlistModuleDetail } from "@/components/compliance/details/identity/identity-allowlist-module-detail";
import { IdentityBlocklistModuleDetail } from "@/components/compliance/details/identity/identity-blocklist-module-detail";
import { IdentityRestrictionModuleDetail } from "@/components/compliance/details/smart-identity/smart-identity-verification-module-detail";
import { getModuleConfig, isModuleEnabled } from "@/lib/compliance/utils";
import {
  ComplianceTypeIdEnum,
  type ComplianceModulePairInput,
  type ComplianceModulePairInputArray,
  type ComplianceParams,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import type { Address } from "viem";

interface ComplianceModuleDetailProps {
  activeModule: {
    typeId: ComplianceTypeId;
    module: Address;
  };
  enabledModules: ComplianceModulePairInputArray;
  onEnable: (modulePair: ComplianceModulePairInput) => void;
  onDisable: (modulePair: ComplianceModulePairInput) => void;
  onClose: () => void;
}

export function ComplianceModuleDetail({
  activeModule,
  enabledModules,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps) {
  const isEnabled = isModuleEnabled(activeModule.typeId, enabledModules);
  const initialValues = isEnabled
    ? getModuleConfig(activeModule.typeId, enabledModules)
    : {
        ...activeModule,
        values: [],
        params: "",
      };

  const complianceDetailProps = {
    module: activeModule.module,
    isEnabled,
    onEnable,
    onDisable,
    onClose,
  };

  // Detail component mapping based on compliance module type
  const detailComponents: Record<ComplianceTypeId, React.ReactNode> = {
    [ComplianceTypeIdEnum.AddressBlockListComplianceModule]: (
      <AddressBlocklistModuleDetail
        typeId="AddressBlockListComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "AddressBlockListComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
    [ComplianceTypeIdEnum.CountryAllowListComplianceModule]: (
      <CountryAllowlistModuleDetail
        typeId="CountryAllowListComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "CountryAllowListComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
    [ComplianceTypeIdEnum.CountryBlockListComplianceModule]: (
      <CountryBlocklistModuleDetail
        typeId="CountryBlockListComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "CountryBlockListComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
    [ComplianceTypeIdEnum.IdentityAllowListComplianceModule]: (
      <IdentityAllowlistModuleDetail
        typeId="IdentityAllowListComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "IdentityAllowListComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
    [ComplianceTypeIdEnum.IdentityBlockListComplianceModule]: (
      <IdentityBlocklistModuleDetail
        typeId="IdentityBlockListComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "IdentityBlockListComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
    [ComplianceTypeIdEnum.SMARTIdentityVerificationComplianceModule]: (
      <IdentityRestrictionModuleDetail
        typeId="SMARTIdentityVerificationComplianceModule"
        initialValues={
          initialValues as Extract<
            ComplianceParams,
            { typeId: "SMARTIdentityVerificationComplianceModule" }
          >
        }
        {...complianceDetailProps}
      />
    ),
  };

  return detailComponents[activeModule.typeId];
}
