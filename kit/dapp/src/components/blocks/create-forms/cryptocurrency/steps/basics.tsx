"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { hasStepFieldErrors } from "@/lib/utils/form-steps";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { CryptoStepProps } from "../form";

export function Basics({ onNext, onBack }: CryptoStepProps) {
  const { control, formState, trigger } =
    useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step - used for validation
  const stepFields = ["assetName", "symbol", "decimals"];

  // Check if any touched fields in this step have errors
  const hasStepErrors = hasStepFieldErrors(stepFields, formState);

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(
      stepFields as (keyof CreateCryptoCurrencyInput)[]
    );
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
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">{t("basics.title")}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("basics.description")}
          </p>
        </div>

        <FormStep
          title={t("basics.title-onchain")}
          description={t("basics.description-onchain")}
        >
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              control={control}
              name="assetName"
              label={t("parameters.common.name-label")}
              placeholder={t("parameters.cryptocurrencies.name-placeholder")}
              required
              maxLength={50}
            />
            <FormInput
              control={control}
              name="symbol"
              label={t("parameters.common.symbol-label")}
              placeholder={t("parameters.cryptocurrencies.symbol-placeholder")}
              alphanumeric
              required
              maxLength={10}
            />
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              required
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

Basics.validatedFields = [
  "assetName",
  "symbol",
  "decimals",
] satisfies (keyof CreateCryptoCurrencyInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "details",
  title: "basics.title",
  description: "basics.description",
  component: Basics,
};
