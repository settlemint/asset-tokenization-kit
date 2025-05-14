"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">
            {t("configuration.bonds.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("configuration.bonds.description")}
          </p>
        </div>

        <FormStep
          title={t("configuration.bonds.title-supply")}
          description={t("configuration.bonds.description-supply")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              defaultValue={18}
              description={t("parameters.common.decimals-description")}
              required
            />
            <FormInput
              control={control}
              name="cap"
              type="number"
              label={t("parameters.bonds.cap-label")}
              description={t("parameters.bonds.cap-description")}
              required
            />
          </div>
        </FormStep>
        <FormStep
          title={t("configuration.bonds.title-value")}
          description={t("configuration.bonds.description-value")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              name="faceValue"
              type="number"
              label={t("parameters.bonds.face-value-label")}
              description={t("parameters.bonds.face-value-description")}
              required
            />
            <FormAssets
              control={control}
              name="underlyingAsset"
              label={t("parameters.bonds.underlying-asset-label")}
              description={t("parameters.bonds.underlying-asset-description")}
              required
            />
          </div>
        </FormStep>
        <FormStep
          title={t("configuration.bonds.title-lifecycle")}
          description={t("configuration.bonds.description-lifecycle")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              type="datetime-local"
              name="maturityDate"
              label={t("parameters.bonds.maturity-date-label")}
              required
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.bonds.title",
  description: "configuration.bonds.description",
  component: Configuration,
};
