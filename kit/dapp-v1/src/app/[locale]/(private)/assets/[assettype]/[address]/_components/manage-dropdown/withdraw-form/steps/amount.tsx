"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

interface AmountProps {
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function Amount({ bondDetails }: AmountProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const target = useWatch({
    control,
    name: "target",
  });

  const isYield = target === "yield";
  const max = isYield ? Number(0) : Number(0);
  //   ? Number(bondDetails.yieldSchedule?.underlyingBalance ?? 0)
  //   : Number(bondDetails.underlyingBalance);
  const noUnderlyingBalance = max === 0;
  const decimals = 18; // isYield
  //   ? bondDetails.yieldSchedule?.underlyingAsset.decimals
  //   : bondDetails.underlyingAsset.decimals;
  const description = noUnderlyingBalance
    ? t("max-limit.withdraw-no-balance")
    : max
      ? t("max-limit.withdraw", {
          limit: formatNumber(max, { locale, decimals }),
        })
      : undefined;

  return (
    <FormStep title={t("title")} description={t("description.withdraw")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={0}
        max={max}
        description={description}
        required
        step={decimals ? 10 ** -decimals : "any"}
        postfix={"WW"}
        disabled={noUnderlyingBalance}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof WithdrawInput)[];
