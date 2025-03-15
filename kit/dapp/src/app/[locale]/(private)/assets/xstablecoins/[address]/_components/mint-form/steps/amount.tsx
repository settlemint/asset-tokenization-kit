"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput } from "@/lib/mutations/stablecoin/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  freeCollateral: number;
  symbol: string;
}

export function Amount({ freeCollateral, symbol }: AmountProps) {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("admin.stablecoins.mint-form.amount");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t("amount-label")}
          type="number"
          min={1}
          max={freeCollateral}
          description={t("collateral-available", {
            collateral: formatNumber(freeCollateral, { token: symbol }),
          })}
          required
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] as const;
