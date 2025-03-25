import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  return (
    <FormStep
      title={t("configuration.bonds.title")}
      description={t("configuration.bonds.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="cap"
          type="number"
          label={t("parameters.bonds.cap-label")}
          description={t("parameters.bonds.cap-description")}
          required
        />
        <FormInput
          control={control}
          name="faceValue"
          type="number"
          label={t("parameters.bonds.face-value-label")}
          description={t("parameters.bonds.face-value-description")}
          required
        />
        <FormInput
          control={control}
          type="date"
          name="maturityDate"
          label={t("parameters.bonds.maturity-date-label")}
          required
        />
        <FormAssets
          control={control}
          name="underlyingAsset"
          label={t("parameters.bonds.underlying-asset-label")}
          description={t("parameters.bonds.underlying-asset-description")}
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
  "cap",
  "faceValue",
  "maturityDate",
  "underlyingAsset",
] as const;
