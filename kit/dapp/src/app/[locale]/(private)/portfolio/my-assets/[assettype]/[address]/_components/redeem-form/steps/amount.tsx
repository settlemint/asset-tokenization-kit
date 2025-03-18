"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { RedeemBondInput } from "@/lib/mutations/bond/redeem/redeem-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
}

export function Amount({ balance }: AmountProps) {
  const { control } = useFormContext<RedeemBondInput>();
  const t = useTranslations("portfolio.my-assets.bond");

  return (
    <FormStep
      title={t("redeem-form.amount.title")}
      description={t("redeem-form.amount.description")}
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t("redeem-form.amount.amount-label")}
          type="number"
          min={1}
          defaultValue={1}
          max={balance}
          description={`${t("redeem-form.amount.balance-description")} ${formatNumber(balance)}`}
          required
        />
      </div>
    </FormStep>
  );
}
