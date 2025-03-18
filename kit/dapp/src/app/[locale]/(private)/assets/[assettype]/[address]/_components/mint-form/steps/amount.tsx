import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={1}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
