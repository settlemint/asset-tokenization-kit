"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormNumberInput } from "@/components/blocks/form/inputs";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  decimals: number;
}

export function Amount({ decimals }: AmountProps) {
  const { control } = useFormContext<TopUpInput>();
  const t = useTranslations("private.assets.details.forms.amount");

  return (
    <FormStep title={t("title")} description={t("description.top-up")}>
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
