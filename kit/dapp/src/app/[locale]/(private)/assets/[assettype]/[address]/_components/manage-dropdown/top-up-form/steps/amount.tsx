"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  max?: number;
  symbol: string;
}

export function Amount({ max, symbol }: AmountProps) {
  const { control } = useFormContext<TopUpInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();

  const noSupply = max === 0;
  const description = noSupply
    ? t("max-limit.top-up-no-supply")
    : max
      ? t("max-limit.top-up", { limit: formatNumber(max, { locale }) })
      : undefined;

  return (
    <FormStep title={t("title")} description={t("description.top-up")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={0}
        max={max}
        step="any"
        description={description}
        postfix={symbol}
        disabled={noSupply}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof TopUpInput)[];
