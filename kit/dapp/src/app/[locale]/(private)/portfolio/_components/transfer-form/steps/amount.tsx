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
  const t = useTranslations("portfolio.transfer-form.amount");
  const locale = useLocale();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormInput
        control={control}
        name="value"
        label={t("amount-label")}
        type="number"
        max={balance}
        description={`${t("balance-description")} ${formatNumber(balance, { locale })}`}
        required
        postfix={symbol}
        step={decimals ? 10 ** -decimals : 1}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["value"] satisfies (keyof TransferInput)[];
