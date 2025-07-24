// TODO: initialModulePairs can also be undefined, but the linting is saying it's always a non nullish value

import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { ComplianceModulesGrid } from "@/components/compliance/compliance-modules-grid";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepSubmit,
  FormStepSubtitle,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import {
  ComplianceTypeIdEnum,
  complianceTypeIds,
  type ComplianceModulePair,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { useStore } from "@tanstack/react-store";
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

    const isDisabledModule = (
      modulePair:
        | ComplianceModulePair
        | { typeId: ComplianceTypeId; disabled: true }
    ): modulePair is { typeId: ComplianceTypeId; disabled: true } => {
      return "disabled" in modulePair && modulePair.disabled;
    };

    const onChange = (
      modulePair:
        | ComplianceModulePair
        | {
            typeId: ComplianceTypeId;
            disabled: true;
          }
    ) => {
      if (isDisabledModule(modulePair)) {
        removeModulePair(modulePair.typeId);
        return;
      }

      setModulePair(modulePair);
    };

    const onEnable = () => {
      setActiveTypeId(null);
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
          onBack={onBack}
          modulePair={{
            typeId: ComplianceTypeIdEnum.CountryAllowListComplianceModule,
            params:
              initialModulePairs?.find(
                (modulePair) =>
                  modulePair.typeId ===
                  ComplianceTypeIdEnum.CountryAllowListComplianceModule
              )?.params ?? [],
          }}
          onChange={onChange}
          onEnable={onEnable}
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

    const isModuleEnabled = (typeId: ComplianceTypeId) => {
      const includedModules =
        initialModulePairs?.map((pair) => pair.typeId) ?? [];
      return includedModules.includes(typeId);
    };

    const modules = complianceTypeIds.reduce(
      (acc, typeId) => {
        const isEnabled = isModuleEnabled(typeId);
        if (isEnabled) {
          acc.configured.push(typeId);
        } else {
          acc.available.push(typeId);
        }
        return acc;
      },
      { configured: [], available: [] } as {
        configured: ComplianceTypeId[];
        available: ComplianceTypeId[];
      }
    );

    return (
      <FormStep>
        <FormStepTitle>{t("compliance.title")}</FormStepTitle>
        <FormStepContent>
          {modules.configured.length > 0 && (
            <>
              <FormStepSubtitle>
                {t("compliance.configured.title")}
              </FormStepSubtitle>
              <FormStepDescription>
                {t("compliance.configured.description")}
              </FormStepDescription>
              <ComplianceModulesGrid
                complianceTypeIds={modules.configured}
                onModuleSelect={(typeId) => {
                  setActiveTypeId(typeId);
                }}
              />
            </>
          )}
          <FormStepSubtitle>{t("compliance.available.title")}</FormStepSubtitle>
          <FormStepDescription>
            {t("compliance.available.description")}
          </FormStepDescription>
          <ComplianceModulesGrid
            complianceTypeIds={modules.available}
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
