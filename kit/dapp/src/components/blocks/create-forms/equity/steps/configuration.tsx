import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { EquityStepProps } from "../form";
import { EquityCategoriesSelect } from "./_components/equity-categories";
import { EquityClassesSelect } from "./_components/equity-classes";

export function Configuration({ onNext, onBack }: EquityStepProps) {
  const { control, formState, trigger } = useFormContext<CreateEquityInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">
            {t("configuration.equities.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("configuration.equities.description")}
          </p>
        </div>

        <FormStep
          title={t("configuration.equities.title-supply")}
          description={t("configuration.equities.description-supply")}
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
          title={t("configuration.equities.title-value")}
          description={t("configuration.equities.description-value")}
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
          title={t("configuration.equities.title-classification")}
          description={t("configuration.equities.description-classification")}
        >
          <div className="grid grid-cols-2 gap-6">
            <EquityClassesSelect
              label={t("parameters.equities.equity-class-label")}
              className="w-full"
            />
            <EquityCategoriesSelect
              label={t("parameters.equities.equity-category-label")}
              className="w-full"
            />
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

Configuration.validatedFields = [
  "decimals",
  "equityCategory",
  "equityClass",
  "price",
] satisfies (keyof CreateEquityInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.equities.title",
  description: "configuration.equities.description",
  component: Configuration,
};
