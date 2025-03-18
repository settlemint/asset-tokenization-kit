import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { UpdateCollateralInput } from "@/lib/mutations/update-collateral/update-collateral-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Amount() {
  const { control } = useFormContext<UpdateCollateralInput>();
  const t = useTranslations(
    "private.assets.details.forms.update-collateral.amount"
  );

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t("amount-label")}
          type="number"
          min={1}
          required
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
