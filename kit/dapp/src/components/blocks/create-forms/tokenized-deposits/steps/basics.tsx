import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateStablecoinInput>();
  const t = useTranslations("private.assets.create");

  return (
    <FormStep title={t("basics.title")} description={t("basics.description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="assetName"
          label={t("parameters.common.name-label")}
          placeholder={t("parameters.tokenizeddeposits.name-placeholder")}
          required
        />
        <div className="grid grid-cols-2 gap-6">
          <FormInput
            control={control}
            name="symbol"
            label={t("parameters.common.symbol-label")}
            placeholder={t("parameters.tokenizeddeposits.symbol-placeholder")}
            textOnly
            required
          />
          <FormInput
            control={control}
            name="isin"
            label={t("parameters.common.isin-label")}
            placeholder={t("parameters.tokenizeddeposits.isin-placeholder")}
          />
        </div>
        <FormInput
          control={control}
          type="number"
          name="decimals"
          label={t("parameters.common.decimals-label")}
          defaultValue={6}
          required
        />
      </div>
    </FormStep>
  );
}

Basics.validatedFields = ["assetName", "symbol", "decimals", "isin"] as const;
