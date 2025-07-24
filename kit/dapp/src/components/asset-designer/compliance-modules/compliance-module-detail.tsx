import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import {
  ComplianceTypeIdEnum,
  type ComplianceModulePair,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { useStore } from "@tanstack/react-store";
import { zeroAddress, zeroHash } from "viem";
import { CountryAllowlistModuleDetail } from "./country-allowlist-module-detail";

const empty: string[] = [];
export const ComplianceModuleDetail = withForm({
  ...assetDesignerFormOptions,
  props: {
    activeTypeId:
      ComplianceTypeIdEnum.CountryAllowListComplianceModule as ComplianceTypeId,
    setActiveTypeId: (_typeId: ComplianceTypeId | null) => {
      noop();
    },
  },
  render: function Render({ form, activeTypeId, setActiveTypeId }) {
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
            )?.values ?? empty
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

    return <>{complianceDetailComponents[activeTypeId]}</>;
  },
});
