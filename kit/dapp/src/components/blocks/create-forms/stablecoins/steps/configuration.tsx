import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { timeUnits } from "@/lib/utils/zod";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateStablecoinInput>();
  const t = useTranslations("private.assets.create");

  const timeUnitOptions = timeUnits.map((value) => ({
    value,
    label: t(`parameters.common.time-units.${value}`, { fallback: value }),
  }));

  const DurationUnitSelect = (
    <FormSelect
      name="collateralLivenessTimeUnit"
      control={control}
      options={timeUnitOptions}
      defaultValue="months"
      className="w-[110px] border-0 shadow-none"
    />
  );

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
          label={t("parameters.common.collateral-proof-validity-label")}
          postfix={DurationUnitSelect}
          required
        />
        <FormInput
          control={control}
          name="valueInBaseCurrency"
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

Configuration.validatedFields = ["collateralLivenessValue"] as const;
