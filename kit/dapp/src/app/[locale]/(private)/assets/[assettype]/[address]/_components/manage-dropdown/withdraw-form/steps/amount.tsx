"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { formatNumber } from '@/lib/utils/number';
import { useLocale, useTranslations } from 'next-intl';
import { useFormContext } from "react-hook-form";

interface AmountProps {
  max: number;
  decimals: number;
  symbol: string;
}

export function Amount({ max, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();

  const noUnderlyingBalance = max === 0;
  const description = noUnderlyingBalance
    ? t("max-limit.withdraw-no-balance")
    : max
      ? t("max-limit.withdraw", { limit: formatNumber(max, { locale }) })
      : undefined;

  return (
    <FormStep title={t("title")} description={t("description.withdraw")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={0}
        max={max}
        step="any"
        description={description}
        postfix={symbol}
        disabled={noUnderlyingBalance}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof WithdrawInput)[];
