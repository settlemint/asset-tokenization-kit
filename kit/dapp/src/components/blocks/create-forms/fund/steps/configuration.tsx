import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
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
          title={t("configuration.funds.title")}
          description={t("configuration.funds.description")}
        >
          <div className="grid grid-cols-2 gap-6">
            <FundCategoriesSelect
              label={t("parameters.funds.fund-category-label")}
            />
            <FundClassesSelect label={t("parameters.funds.fund-class-label")} />
            <FormInput
              control={control}
              type="number"
              name="managementFeeBps"
              label={t("parameters.funds.management-fee-label")}
              description={t("parameters.funds.management-fee-description")}
              postfix={t("parameters.funds.basis-points")}
              required
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
  "fundCategory",
  "fundClass",
  "managementFeeBps",
  "price",
] satisfies (keyof CreateFundInput)[];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "configuration",
  title: "configuration.funds.title",
  description: "configuration.funds.description",
  component: Configuration,
};
