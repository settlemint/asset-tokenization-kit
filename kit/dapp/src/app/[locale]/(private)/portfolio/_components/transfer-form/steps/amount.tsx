"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { TransferInput } from "@/lib/mutations/transfer/transfer-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  decimals: number;
  symbol: string;
}

export function Amount({ balance, decimals, symbol }: AmountProps) {
  const { control } = useFormContext<TransferInput>();
  const t = useTranslations("portfolio.my-assets.cryptocurrency");
  const locale = useLocale();

  return (
    <FormStep
      title={t("transfer-form.amount.title")}
      description={t("transfer-form.amount.description")}
    >
      <FormInput
        control={control}
        name="value"
        label={t("transfer-form.amount.amount-label")}
        type="number"
        max={balance}
        description={`${t("transfer-form.amount.balance-description")} ${formatNumber(balance, { locale })}`}
        required
        postfix={symbol}
        step={decimals ? 10 ** -decimals : 1}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["value"] as const;
