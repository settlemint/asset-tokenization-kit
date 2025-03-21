import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxLimit?: number;
  decimals: number;
  symbol: string;
}

export function Amount({ maxLimit, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const maxLimitDescription = maxLimit
    ? t("max-limit.mint", { limit: formatNumber(maxLimit, { locale }) })
    : undefined;
  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormNumberInput
        control={control}
        name="amount"
        label={t("label")}
        minNotZero
        max={maxLimit}
        decimals={decimals}
        description={maxLimitDescription}
        formatDisplay
        required
        postfix={symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
