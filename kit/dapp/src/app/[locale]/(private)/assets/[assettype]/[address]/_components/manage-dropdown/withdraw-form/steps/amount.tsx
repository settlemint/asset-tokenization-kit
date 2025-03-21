"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  decimals: number;
}

export function Amount({ decimals }: AmountProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep title={t("title")} description={t("description.withdraw")}>
      <FormNumberInput
        control={control}
        name="amount"
        minNotZero
        decimals={decimals}
        step="any"
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
