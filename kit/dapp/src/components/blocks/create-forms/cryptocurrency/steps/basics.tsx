"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { CryptoStepProps } from "../form";

export function Basics({ onNext, onBack }: CryptoStepProps) {
  const { control, formState, trigger } =
    useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");

  // Fields for this step - used for validation
  const stepFields = ["assetName", "symbol", "decimals"];

  // Check if there are errors in the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

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
            Specify the basic information for this cryptocurrency.
          </p>
        </div>

        <FormStep
          title={t("basics.title")}
          description="Enter the essential details that identify your cryptocurrency."
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-1 gap-6 w-full">
            <FormInput
              control={control}
              name="assetName"
              label={t("parameters.common.name-label")}
              placeholder={t("parameters.cryptocurrencies.name-placeholder")}
              description="The name of the cryptocurrency. This is used to identify the cryptocurrency in the UI and cannot be changed after creation."
              required
              maxLength={50}
            />
            <FormInput
              control={control}
              name="symbol"
              label={t("parameters.common.symbol-label")}
              placeholder={t("parameters.cryptocurrencies.symbol-placeholder")}
              description="The symbol of the cryptocurrency. This a unique identifier for the cryptocurrency for onchain purposes."
              textOnly
              required
              maxLength={10}
            />
            <FormInput
              control={control}
              type="number"
              name="decimals"
              label={t("parameters.common.decimals-label")}
              description="The number of decimal places for the cryptocurrency. This determines the smallest unit of the cryptocurrency."
              defaultValue={18}
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
