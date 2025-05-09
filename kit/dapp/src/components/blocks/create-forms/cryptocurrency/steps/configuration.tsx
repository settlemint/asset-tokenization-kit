"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { CryptoStepProps } from "../form";

export function Configuration({ onNext, onBack }: CryptoStepProps) {
  const { control, formState, trigger } =
    useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  // Fields for this step - used for validation
  const stepFields = ["initialSupply", "price.amount", "price.currency"];

  // Check if there are errors in the current step's fields
  const hasStepErrors = stepFields.some((field) => {
    const [parent, child] = field.split(".");
    if (child) {
      return !!(
        formState.errors[parent as keyof typeof formState.errors] as any
      )?.[child];
    }
    return !!formState.errors[field as keyof typeof formState.errors];
  });

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(stepFields as any);
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
          <h3 className="text-lg font-medium">Cryptocurrency Configuration</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Set parameters specific to your cryptocurrency.
          </p>
        </div>

        <FormStep
          title="Cryptocurrency Configuration"
          description="Configure initial supply and pricing for your cryptocurrency."
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-2 gap-6 w-full">
            <FormInput
              control={control}
              name="initialSupply"
              type="number"
              label={t("parameters.cryptocurrencies.initial-supply-label")}
              description={t(
                "parameters.cryptocurrencies.initial-supply-description"
              )}
              required
            />

            <FormInput
              control={control}
              type="number"
              name="price.amount"
              required
              label={t("parameters.common.price-label")}
              description="The initial price of the cryptocurrency."
              postfix={
                <FormSelect
                  name="price.currency"
                  control={control}
                  options={currencyOptions}
                  className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
                />
              }
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

Configuration.validatedFields = [
  "initialSupply",
  "price",
] satisfies (keyof CreateCryptoCurrencyInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.cryptocurrencies.title",
  description: "configuration.cryptocurrencies.description",
  component: Configuration,
};
