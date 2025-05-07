"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface BasicsProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function Basics({ onNext, onBack }: BasicsProps) {
  const { control, formState, trigger } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step - used for validation
  const stepFields = ["assetName", "symbol", "decimals", "isin"];

  // We can directly use formState.isValid for the whole form (resolver validates everything)
  // But for a multi-step form, we only want to check the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
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
      <FormStep title={t("basics.title")} description={t("basics.description")}>
        <div className="grid grid-cols-1 gap-6">
          <FormInput
            control={control}
            name="assetName"
            label={t("parameters.common.name-label")}
            placeholder={t("parameters.bonds.name-placeholder")}
            required
            maxLength={50}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              name="symbol"
              label={t("parameters.common.symbol-label")}
              placeholder={t("parameters.bonds.symbol-placeholder")}
              textOnly
              required
              maxLength={10}
            />
            <FormInput
              control={control}
              name="isin"
              label={t("parameters.common.isin-label")}
              placeholder={t("parameters.bonds.isin-placeholder")}
            />
          </div>
          <FormInput
            control={control}
            type="number"
            name="decimals"
            label={t("parameters.common.decimals-label")}
            defaultValue={18}
            required
          />
        </div>
      </FormStep>
    </StepContent>
  );
}

// Export step definition for the asset designer
export const stepDefinition = {
  id: "details",
  title: "Basic Details",
  description: "Enter basic information about your bond",
  component: Basics,
};
