import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxLimit?: number;
  decimals: number;
}

export function Amount({ maxLimit, decimals }: AmountProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const maxLimitDescription = maxLimit
    ? t("max-limit.burn", { limit: formatNumber(maxLimit, { locale }) })
    : undefined;

  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormNumberInput
        control={control}
        name="amount"
        minNotZero
        decimals={decimals}
        max={maxLimit}
        description={maxLimitDescription}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
