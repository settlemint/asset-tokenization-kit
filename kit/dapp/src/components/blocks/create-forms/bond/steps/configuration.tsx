"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext, type UseFormReturn } from "react-hook-form";

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

Configuration.validatedFields = [
  "decimals",
  "cap",
  "faceValue",
  "underlyingAsset",
] satisfies (keyof CreateBondInput)[];

/**
 * Custom validation function for maturity date
 *
 * Note: We use this custom validation approach instead of
 * relying on the schema refinement defined in create-schema.ts because
 * refinement properties don't work reliably with @hookform/typebox resolver.
 * This ensures the validation is properly applied and error messages are displayed.
 */
const validateMaturityDate = async (form: UseFormReturn<CreateBondInput>) => {
  const maturityDate = form.getValues("maturityDate");
  if (!maturityDate) {
    return false;
  }

  if (!isValidFutureDate(maturityDate, 1)) {
    // Using the translation key directly, which will be resolved by the Form component's
    // error formatting mechanism that automatically handles translations
    form.setError("maturityDate", {
      type: "manual",
      message: "private.assets.create.parameters.bonds.maturity-date-error",
    });

    return false;
  }

  return true;
};

Configuration.customValidation = [validateMaturityDate];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.bonds.title",
  description: "configuration.bonds.description",
  component: Configuration,
};
