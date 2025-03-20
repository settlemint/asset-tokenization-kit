import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("private.assets.create");

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
          name="valueInBaseCurrency"
          type="number"
          min={0}
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

Configuration.validatedFields = ["initialSupply"] as const;
