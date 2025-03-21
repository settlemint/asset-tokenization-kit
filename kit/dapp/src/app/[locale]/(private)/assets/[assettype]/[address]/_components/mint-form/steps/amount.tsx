import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  max?: number;
  decimals?: number;
  symbol: string;
}

export function Amount({ max, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const description = max
    ? t("max-limit.mint", { limit: formatNumber(max, { locale }) })
    : undefined;
  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormInput
        control={control}
        label={t("label")}
        name="amount"
        type="number"
        max={max}
        step={decimals ? 10 ** -decimals : 1}
        description={description}
        required
        postfix={symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
