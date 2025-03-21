import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateTokenizedDepositInput } from "@/lib/mutations/tokenized-deposit/create/create-schema";
import { timeUnits } from "@/lib/utils/zod";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateTokenizedDepositInput>();
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

  return (
    <FormStep
      title={t("configuration.tokenizeddeposits.title")}
      description={t("configuration.tokenizeddeposits.description")}
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
              className="border-l-0 rounded-l-none w-26 shadow-none"
            />
          }
        />
        <FormInput
          control={control}
          name="valueInBaseCurrency"
          type="number"
          step={0.01}
          min={0}
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
  "collateralLivenessValue",
  "collateralLivenessTimeUnit",
] as const;
