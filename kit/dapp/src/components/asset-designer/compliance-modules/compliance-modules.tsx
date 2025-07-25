import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { ComplianceModulesGrid } from "@/components/compliance/compliance-modules-grid";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepHeader,
  FormStepSubmit,
  FormStepSubtitle,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

import { ComplianceModuleDetail } from "@/components/asset-designer/compliance-modules/compliance-module-detail";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import {
  complianceTypeIds,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { useStore } from "@tanstack/react-store";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const empty: never[] = [];

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

    if (activeTypeId) {
      return (
        <ComplianceModuleDetail
          activeTypeId={activeTypeId}
          setActiveTypeId={setActiveTypeId}
          form={form}
        />
      );
    }

    const isModuleEnabled = (typeId: ComplianceTypeId) => {
      const includedModules =
        initialModulePairs?.map((pair) => pair.typeId) ?? [];
      return includedModules.includes(typeId);
    };

    const modules = complianceTypeIds.reduce<{
      configured: ComplianceTypeId[];
      available: ComplianceTypeId[];
    }>(
      (acc, typeId) => {
        const isEnabled = isModuleEnabled(typeId);
        if (isEnabled) {
          acc.configured.push(typeId);
        } else {
          acc.available.push(typeId);
        }
        return acc;
      },
      { configured: [], available: [] }
    );

    return (
      <FormStep>
        <FormStepHeader>
          <FormStepTitle>{t("compliance.title")}</FormStepTitle>
          <FormStepDescription>
            {t("compliance.description")}
          </FormStepDescription>
        </FormStepHeader>
        <FormStepContent>
          {modules.configured.length > 0 && (
            <>
              <FormStepHeader>
                <FormStepSubtitle>
                  {t("compliance.configured.title")}
                </FormStepSubtitle>
                <FormStepDescription>
                  {t("compliance.configured.description")}
                </FormStepDescription>
              </FormStepHeader>
              <ComplianceModulesGrid
                complianceTypeIds={modules.configured}
                onModuleSelect={(typeId) => {
                  setActiveTypeId(typeId);
                }}
              />
            </>
          )}
          <FormStepHeader>
            <FormStepSubtitle>
              {t("compliance.available.title")}
            </FormStepSubtitle>
            <FormStepDescription>
              {t("compliance.available.description")}
            </FormStepDescription>
          </FormStepHeader>
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
            validate={empty}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
