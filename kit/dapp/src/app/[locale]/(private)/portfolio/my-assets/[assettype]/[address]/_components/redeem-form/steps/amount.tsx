"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { RedeemBondInput } from "@/lib/mutations/bond/redeem/redeem-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  decimals: number;
}

export function Amount({ balance, decimals }: AmountProps) {
  const { control } = useFormContext<RedeemBondInput>();
  const t = useTranslations("portfolio.my-assets.bond");
  const locale = useLocale();

  return (
    <FormStep
      title={t("redeem-form.amount.title")}
      description={t("redeem-form.amount.description")}
    >
      <div className="grid grid-cols-1 gap-6">
        <FormNumberInput
          control={control}
          name="amount"
          label={t("redeem-form.amount.amount-label")}
          decimals={decimals}
          minNotZero
          defaultValue={1}
          max={balance}
          description={`${t("redeem-form.amount.balance-description")} ${formatNumber(balance, { locale })}`}
          required
        />
      </div>
    </FormStep>
  );
}
