import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { EquityCategoriesSelect } from "./_components/equity-categories";
import { EquityClassesSelect } from "./_components/equity-classes";

export function Configuration() {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
    <FormStep
      title={t("configuration.equities.title")}
      description={t("configuration.equities.description")}
    >
      <div className="grid grid-cols-1 gap-6">
        <EquityClassesSelect
          label={t("parameters.equities.equity-class-label")}
        />
        <EquityCategoriesSelect
          label={t("parameters.equities.equity-category-label")}
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
  );
}

Configuration.validatedFields = [
  "equityCategory",
  "equityClass",
  "managementFeeBps",
] as const;
