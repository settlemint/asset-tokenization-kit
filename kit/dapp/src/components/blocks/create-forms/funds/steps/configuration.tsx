import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { FundCategoriesSelect } from "./_components/fund-categories";
import { FundClassesSelect } from "./_components/fund-classes";

interface ConfigurationProps {
  userCurrency: CurrencyCode;
}

export function Configuration({ userCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateFundInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
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
              defaultValue={userCurrency}
              className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
            />
          }
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  "fundCategory",
  "fundClass",
  "managementFeeBps",
] as const;
