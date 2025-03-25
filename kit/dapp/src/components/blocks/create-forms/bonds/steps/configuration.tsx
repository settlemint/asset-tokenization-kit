import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations("private.assets.create");

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
          name="valueInBaseCurrency"
          min={0}
          type="number"
          step={0.01}
          label={t("parameters.common.value-in-base-currency-label", {
            baseCurrency,
          })}
          required
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
  "valueInBaseCurrency",
] satisfies (keyof CreateBondInput)[];
