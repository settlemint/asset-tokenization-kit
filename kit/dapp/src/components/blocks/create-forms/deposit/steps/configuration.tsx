"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
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
          <h3 className="text-lg font-medium">
            {t("configuration.deposits.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("configuration.deposits.description")}
          </p>
        </div>

        <FormStep
          title={t("configuration.deposits.title")}
          description={t("configuration.deposits.description")}
          className="w-full"
          contentClassName="w-full"
        >
          <div className="grid grid-cols-2 gap-6 w-full">
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
};
