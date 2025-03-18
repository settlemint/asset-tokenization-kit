import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxLimit?: number;
}

export function Amount({ maxLimit }: AmountProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const maxLimitDescription = maxLimit
    ? t("max-limit.burn", { limit: formatNumber(maxLimit) })
    : undefined;

  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={1}
        max={maxLimit}
        description={maxLimitDescription}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
