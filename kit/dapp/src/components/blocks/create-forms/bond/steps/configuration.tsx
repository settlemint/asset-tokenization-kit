"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { isValidFutureDate } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface ConfigurationProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function Configuration({ onNext, onBack }: ConfigurationProps) {
  const { control, formState, trigger, setError, getValues } =
    useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step
  const stepFields = ["cap", "faceValue", "underlyingAsset", "maturityDate"];

  // Check for any errors in this step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Special validation for maturity date (this can't be handled by TypeBox schema)
  const validateMaturityDate = async () => {
    const maturityDate = getValues("maturityDate");
    if (!maturityDate) return false;

    if (!isValidFutureDate(maturityDate, 1)) {
      setError("maturityDate", {
        type: "manual",
        message: "private.assets.create.parameters.bonds.maturity-date-error",
      });
      return false;
    }

    return true;
  };

  // Handle next button click - validate fields before proceeding
  const handleNext = async () => {
    // Check maturity date first since TypeBox schema can't handle this
    const isMaturityDateValid = await validateMaturityDate();
    if (!isMaturityDateValid) return;

    // Then trigger validation for fields in this step
    const isValid = await trigger(stepFields as (keyof CreateBondInput)[]);
    if (isValid && onNext) {
      onNext();
    }
  };

  return (
    <StepContent
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={hasStepErrors}
      showBackButton={!!onBack}
    >
      <FormStep
        title={t("configuration.bonds.title")}
        description={t("configuration.bonds.description")}
      >
        <div className="grid grid-cols-2 gap-6">
          <FormInput
            control={control}
            name="cap"
            type="number"
            label={t("parameters.bonds.cap-label")}
            description={t("parameters.bonds.cap-description")}
            required
          />
          <FormInput
            control={control}
            name="faceValue"
            type="number"
            label={t("parameters.bonds.face-value-label")}
            description={t("parameters.bonds.face-value-description")}
            required
          />
          <FormInput
            control={control}
            type="datetime-local"
            name="maturityDate"
            label={t("parameters.bonds.maturity-date-label")}
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
    </StepContent>
  );
}

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "Bond Configuration",
  description: "Configure bond-specific properties",
  component: Configuration,
};
