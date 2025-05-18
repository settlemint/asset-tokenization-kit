import type { AssetFormStep } from "@/components/blocks/asset-designer/types";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { FundCategoriesSelect } from "./_components/fund-categories";
import { FundClassesSelect } from "./_components/fund-classes";

export function Configuration() {
  const { control } = useFormContext<CreateFundInput>();
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
            {t("configuration.funds.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("configuration.funds.description")}
          </p>
        </div>

        <FormStep
          title={t("configuration.stablecoins.title-supply")}
          description={t("configuration.stablecoins.description-supply")}
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
          title={t("configuration.funds.title-value")}
          description={t("configuration.funds.description-value")}
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
            <FormInput
              control={control}
              type="number"
              name="managementFeeBps"
              label={t("parameters.funds.management-fee-label")}
              description={t("parameters.funds.management-fee-description")}
              postfix={t("parameters.funds.basis-points")}
              required
            />
          </div>
        </FormStep>

        <FormStep
          title={t("configuration.funds.title-classification")}
          description={t("configuration.funds.description-classification")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FundCategoriesSelect
              label={t("parameters.funds.fund-category-label")}
              className="w-full"
            />
            <FundClassesSelect
              label={t("parameters.funds.fund-class-label")}
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
  "fundCategory",
  "fundClass",
  "managementFeeBps",
  "price",
] satisfies (keyof CreateFundInput)[];

// Export step definition for the asset designer
export const stepDefinition: AssetFormStep & {
  component: typeof Configuration;
} = {
  id: "configuration",
  title: "configuration.funds.title",
  description: "configuration.funds.description",
  component: Configuration,
};
