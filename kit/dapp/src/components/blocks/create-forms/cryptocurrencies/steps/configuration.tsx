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
    <FormStep
      title={t("configuration.cryptocurrencies.title")}
      description={t("configuration.cryptocurrencies.description")}
    >
      <div className="grid grid-cols-2 gap-6">
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
  "initialSupply",
] satisfies (keyof CreateCryptoCurrencyInput)[];
