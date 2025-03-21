import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { UpdateCollateralInput } from "@/lib/mutations/update-collateral/update-collateral-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  decimals: number;
}

export function Amount({ decimals }: AmountProps) {
  const { control } = useFormContext<UpdateCollateralInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep
      title={t("title")}
      description={t("description.update-collateral")}
    >
      <FormNumberInput
        control={control}
        name="amount"
        decimals={decimals}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
