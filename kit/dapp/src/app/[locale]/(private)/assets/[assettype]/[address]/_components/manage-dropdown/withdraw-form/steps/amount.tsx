"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  maxAmount?: number;
  decimals?: number;
  symbol?: string;
}

export function Amount({ maxAmount, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();

  // Format the description with available balance
  const description =
    maxAmount !== undefined
      ? `Available balance: ${formatNumber(maxAmount, { locale, decimals, token: symbol })}`
      : undefined;

  return (
    <FormStep title={t("title")} description={t("description.withdraw")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={0}
        max={maxAmount}
        description={description}
        required
        step={decimals ? 10 ** -decimals : "any"}
        postfix={symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof WithdrawInput)[];
