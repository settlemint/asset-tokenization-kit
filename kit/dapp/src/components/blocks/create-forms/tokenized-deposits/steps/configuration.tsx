import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateTokenizedDepositInput } from "@/lib/mutations/tokenized-deposit/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateTokenizedDepositInput>();
  const t = useTranslations("private.assets.create");

  return (
    <FormStep
      title={t("configuration.tokenizeddeposits.title")}
      description={t("configuration.tokenizeddeposits.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label={t("parameters.common.collateral-proof-validity-label")}
          postfix={t("parameters.common.seconds-unit-label")}
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

Configuration.validatedFields = ["collateralLivenessSeconds"] as const;
