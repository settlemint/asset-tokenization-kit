import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { timeUnits } from "@/lib/utils/typebox/time-units";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { StablecoinStepProps } from "../form";

export function Configuration({ onNext, onBack }: StablecoinStepProps) {
  const { control, formState, trigger } =
    useFormContext<CreateStablecoinInput>();
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

  // Fields for this step - used for validation
  const stepFields = [
    "collateralLivenessValue",
    "collateralLivenessTimeUnit",
    "price.amount",
    "price.currency",
  ];

  // Check if there are errors in the current step's fields
  const hasStepErrors = stepFields.some(
    (field) => !!formState.errors[field as keyof typeof formState.errors]
  );

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for just these fields
    const isValid = await trigger(
      stepFields as (keyof CreateStablecoinInput)[]
    );
    if (isValid && onNext) {
      onNext();
    }
  };

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">
            {t("configuration.stablecoins.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("configuration.stablecoins.description")}
          </p>
        </div>

        <FormStep
          title={t("configuration.stablecoins.title")}
          description={t("configuration.stablecoins.description")}
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
] satisfies (keyof CreateStablecoinInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.stablecoins.title",
  description: "configuration.stablecoins.description",
  component: Configuration,
};
