"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import type { CreateDepositInput } from "@/lib/mutations/deposit/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { timeUnits } from "@/lib/utils/typebox/time-units";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateDepositInput>();
  const t = useTranslations("private.assets.create");
  const collateralLivenessValue = useWatch({
    control,
    name: "collateralLivenessValue",
  });
  const timeUnitOptions = timeUnits.map((value) => ({
    value,
    label:
      Number(collateralLivenessValue) === 1
        ? t(`parameters.common.time-units.singular.${value}`)
        : t(`parameters.common.time-units.plural.${value}`),
  }));
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">{t(stepDefinition.title)}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t(stepDefinition.description)}
          </p>
        </div>

        <FormStep
          title={t("configuration.deposits.title-supply")}
          description={t("configuration.deposits.description-supply")}
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
          </div>
        </FormStep>

        <FormStep
          title={t("configuration.deposits.title-value")}
          description={t("configuration.deposits.description-value")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              type="number"
              name="price.amount"
              required
              label={t("parameters.common.price-label")}
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

        <FormStep
          title={t("configuration.deposits.title-collateral")}
          description={t("configuration.deposits.description-collateral")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              control={control}
              type="number"
              name="collateralLivenessValue"
              required
              label={t("parameters.common.collateral-proof-validity-label")}
              postfix={
                <FormSelect
                  name="collateralLivenessTimeUnit"
                  control={control}
                  options={timeUnitOptions}
                  defaultValue="months"
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
  "collateralLivenessValue",
  "collateralLivenessTimeUnit",
  "price",
] satisfies (keyof CreateDepositInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.deposits.title",
  description: "configuration.deposits.description",
  component: Configuration,
} as const;
