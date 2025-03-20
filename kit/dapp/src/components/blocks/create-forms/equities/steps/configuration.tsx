import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { EquityCategoriesSelect } from "./_components/equity-categories";
import { EquityClassesSelect } from "./_components/equity-classes";

interface ConfigurationProps {
  baseCurrency: CurrencyCode;
}

export function Configuration({ baseCurrency }: ConfigurationProps) {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations("private.assets.create");

  return (
    <FormStep
      title={t("configuration.equities.title")}
      description={t("configuration.equities.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <EquityClassesSelect
          label={t("parameters.equities.equity-class-label")}
        />
        <EquityCategoriesSelect
          label={t("parameters.equities.equity-category-label")}
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
  "equityCategory",
  "equityClass",
  "managementFeeBps",
] as const;
