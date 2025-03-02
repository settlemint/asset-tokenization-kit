import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations("admin.cryptocurrencies.create-form.configuration");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="initialSupply"
          label={t("initial-supply-label")}
          description={t("initial-supply-description")}
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
