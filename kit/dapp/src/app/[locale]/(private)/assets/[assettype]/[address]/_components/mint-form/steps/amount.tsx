import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxLimit?: number;
}

export function Amount({ maxLimit }: AmountProps) {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const maxLimitDescription = maxLimit
    ? t("max-limit.mint", { limit: formatNumber(maxLimit) })
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
