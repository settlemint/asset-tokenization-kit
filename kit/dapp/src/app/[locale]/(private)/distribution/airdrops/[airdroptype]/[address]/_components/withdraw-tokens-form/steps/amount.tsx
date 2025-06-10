"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { WithdrawTokensFromAirdropInput } from "@/lib/mutations/airdrop/withdraw-token/withdraw-token-schema";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  decimals: number;
  symbol: string;
}

export function Amount({ balance, decimals, symbol }: AmountProps) {
  const t = useTranslations("private.airdrops.detail.forms.withdraw-tokens");

  const { control } = useFormContext<WithdrawTokensFromAirdropInput>();
  const locale = useLocale();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormInput
        control={control}
        label={t("amount-label")}
        name="amount"
        type="number"
        max={balance}
        step={decimals ? 10 ** -decimals : 1}
        required
        postfix={symbol}
      />
    </FormStep>
  );
}

Amount.validatedFields = [
  "amount",
] satisfies (keyof WithdrawTokensFromAirdropInput)[];
