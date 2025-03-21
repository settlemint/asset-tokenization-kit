"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { TransferInput } from "@/lib/mutations/transfer/transfer-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  decimals: number;
}

export function Amount({ balance, decimals }: AmountProps) {
  const { control } = useFormContext<TransferInput>();
  const t = useTranslations("portfolio.my-assets.cryptocurrency");
  const locale = useLocale();

  return (
    <FormStep
      title={t("transfer-form.amount.title")}
      description={t("transfer-form.amount.description")}
    >
      <FormNumberInput
        control={control}
        name="value"
        label={t("transfer-form.amount.amount-label")}
        decimals={decimals}
        minNotZero
        defaultValue={1}
        max={balance}
        description={`${t("transfer-form.amount.balance-description")} ${formatNumber(balance, { locale })}`}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["value"] as const;
