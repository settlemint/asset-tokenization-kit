import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxBurnAmount: number;
}

export function Amount({ maxBurnAmount }: AmountProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep title={t("title")} description={t("description.burn")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={1}
        max={maxBurnAmount}
        required
      />
      {/* description={t("available-balance", {
            balance: formatNumber(maxBurnAmount),
          })} */}
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
