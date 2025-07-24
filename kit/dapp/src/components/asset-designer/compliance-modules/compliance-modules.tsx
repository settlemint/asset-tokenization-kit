// TODO: initialModulePairs can also be undefined, but the linting is saying it's always a non nullish value

import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { ComplianceModulesGrid } from "@/components/compliance/compliance-modules-grid";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepSubmit,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import {
  ComplianceTypeIdEnum,
  complianceTypeIds,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CountryAllowlistModuleDetail } from "./country-allowlist-module-detail";

const validate: never[] = [];

export const ComplianceModules = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation("asset-designer");
    const [activeTypeId, setActiveTypeId] = useState<ComplianceTypeId | null>(
      null
    );

    const complianceDetailComponents: Record<
      ComplianceTypeId,
      React.ReactNode
    > = {
      [ComplianceTypeIdEnum.AddressBlockListComplianceModule]: (
        <div>Address Block List</div>
      ),
      [ComplianceTypeIdEnum.CountryAllowListComplianceModule]: (
        <CountryAllowlistModuleDetail
          onBack={() => {
            setActiveTypeId(null);
          }}
          onEnable={() => {
            noop();
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

    return (
      <FormStep>
        <FormStepTitle>{t("compliance.title")}</FormStepTitle>
        <FormStepDescription>{t("compliance.description")}</FormStepDescription>
        <FormStepContent>
          <ComplianceModulesGrid
            complianceTypeIds={complianceTypeIds}
            onModuleSelect={(typeId) => {
              setActiveTypeId(typeId);
            }}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={validate}
            checkRequiredFn={() => false}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
