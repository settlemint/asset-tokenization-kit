import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { FormLabel } from "@/components/ui/form";
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

  return (
    <FormStep
      title={t("configuration.stablecoins.title")}
      description={t("configuration.stablecoins.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>
            {t("parameters.common.collateral-proof-validity-label")}
          </FormLabel>
          <div className="pt-3 grid grid-cols-2">
            <FormInput
              control={control}
              type="number"
              name="collateralLivenessValue"
              required
              className="rounded-r-none border-r-0 focus:border-r focus:ring-0"
            />
            <FormSelect
              name="collateralLivenessTimeUnit"
              control={control}
              options={timeUnitOptions}
              defaultValue="months"
              className="rounded-l-none border-l-0 focus:border-l focus:ring-0"
            />
          </div>
        </div>
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
