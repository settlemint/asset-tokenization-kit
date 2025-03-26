import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { timeUnits } from "@/lib/utils/typebox/time-units";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateStablecoinInput>();
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
  );
}

Configuration.validatedFields = [
  "collateralLivenessValue",
  "collateralLivenessTimeUnit",
  "price",
] satisfies (keyof CreateStablecoinInput)[];
