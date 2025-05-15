"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Cryptocurrency Configuration</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Set parameters specific to your cryptocurrency.
          </p>
        </div>

        <FormStep
          title={t("configuration.cryptocurrencies.title-supply")}
          description={t("configuration.cryptocurrencies.description-supply")}
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
              name="initialSupply"
              type="number"
              label={t("parameters.cryptocurrencies.initial-supply-label")}
              description={t(
                "parameters.cryptocurrencies.initial-supply-description"
              )}
              required
            />
          </div>
        </FormStep>

        <FormStep
          title={t("configuration.cryptocurrencies.title-value")}
          description={t("configuration.cryptocurrencies.description-value")}
        >
          <div className="grid grid-cols-2 gap-6">
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
  "decimals",
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
