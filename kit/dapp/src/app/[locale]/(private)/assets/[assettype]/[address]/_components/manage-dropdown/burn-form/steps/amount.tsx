import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  max: number;
  decimals: number;
  symbol: string;
}

export function Amount({ max, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const maxDescription = max
    ? t("max-limit.burn", { limit: formatNumber(max, { locale }) })
    : undefined;

  return (
    <FormStep title={t("title")} description={t("description.burn")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        step={decimals ? 10 ** -decimals : 1}
        max={max}
        description={maxDescription}
        required
        postfix={symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof BurnInput)[];
