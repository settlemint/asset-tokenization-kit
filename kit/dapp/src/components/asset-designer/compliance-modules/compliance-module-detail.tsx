// TODO: initialModulePairs can also be undefined, but the linting is saying it's always a non nullish value

import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";

import { withForm } from "@/hooks/use-app-form";
import {
  ComplianceTypeIdEnum,
  type ComplianceModulePair,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { useStore } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";
import { zeroAddress, zeroHash } from "viem";
import { CountryAllowlistModuleDetail } from "./country-allowlist-module-detail";

export const ComplianceModuleDetail = withForm({
  ...assetDesignerFormOptions,
  props: {
    activeTypeId: null as ComplianceTypeId | null,
    setActiveTypeId: (_typeId: ComplianceTypeId | null) => {},
  },
  render: function Render({ form, activeTypeId, setActiveTypeId }) {
    const { t } = useTranslation("asset-designer");

    const initialModulePairs = useStore(
      form.store,
      (state) => state.values.initialModulePairs
    );

    const setModulePair = (modulePair: ComplianceModulePair) => {
      const modulePairsWithoutType = initialModulePairs?.filter(
        (pair) => pair.typeId !== modulePair.typeId
      );
      form.setFieldValue("initialModulePairs", () => {
        return [...(modulePairsWithoutType ?? []), modulePair];
      });
    };

    const removeModulePair = (typeId: ComplianceTypeId) => {
      form.setFieldValue("initialModulePairs", () => {
        return initialModulePairs?.filter((pair) => pair.typeId !== typeId);
      });
    };

    const onBack = () => {
      setActiveTypeId(null);
    };

    const complianceDetailComponents: Record<
      ComplianceTypeId,
      React.ReactNode
    > = {
      [ComplianceTypeIdEnum.AddressBlockListComplianceModule]: (
        <div>Address Block List</div>
      ),
      [ComplianceTypeIdEnum.CountryAllowListComplianceModule]: (
        <CountryAllowlistModuleDetail
          close={onBack}
          values={
            initialModulePairs?.find(
              (modulePair) =>
                modulePair.typeId ===
                ComplianceTypeIdEnum.CountryAllowListComplianceModule
            )?.values ?? []
          }
          onEnable={(values) => {
            setModulePair({
              typeId: ComplianceTypeIdEnum.CountryAllowListComplianceModule,
              values,
              module: zeroAddress,
              params: zeroHash,
            });
          }}
          onDisable={() => {
            removeModulePair(
              ComplianceTypeIdEnum.CountryAllowListComplianceModule
            );
          }}
        />
      ),
      [ComplianceTypeIdEnum.CountryBlockListComplianceModule]: (
        <div>Country Block List</div>
      ),
      [ComplianceTypeIdEnum.IdentityAllowListComplianceModule]: (
        <div>Identity Allow List</div>
      ),
      [ComplianceTypeIdEnum.IdentityBlockListComplianceModule]: (
        <div>Identity Block List</div>
      ),
      [ComplianceTypeIdEnum.SMARTIdentityVerificationComplianceModule]: (
        <div>SMART Identity Verification</div>
      ),
    };

    if (activeTypeId) {
      return <>{complianceDetailComponents[activeTypeId]}</>;
    }

    // This is not possible to reach, because typescript will error if there is no component configured for a compliance module typeId in the map above
    console.error(
      `Component not configured for compliance module withtypeId: ${activeTypeId}`
    );
    return <div>{t("messages.comingSoon")}</div>;
  },
});
