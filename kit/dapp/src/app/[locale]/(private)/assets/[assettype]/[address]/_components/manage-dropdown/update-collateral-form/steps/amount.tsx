import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { UpdateCollateralInput } from "@/lib/mutations/update-collateral/update-collateral-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
  const { control } = useFormContext<UpdateCollateralInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep
      title={t("title")}
      description={t("description.update-collateral")}
    >
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
