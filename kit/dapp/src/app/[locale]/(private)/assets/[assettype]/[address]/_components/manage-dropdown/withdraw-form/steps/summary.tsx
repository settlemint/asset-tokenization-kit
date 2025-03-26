"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

interface SummaryProps {
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function Summary({ bondDetails }: SummaryProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = useWatch({
    control: control,
  });
  const locale = useLocale();

  // Get the appropriate decimals and symbol from bond details
  const decimals = bondDetails?.underlyingAsset?.decimals ?? 0;
  const tokenSymbol = bondDetails?.underlyingAsset?.symbol ?? "";

  return (
    <FormStep
      title={t("title.withdraw")}
      description={t("description.withdraw")}
    >
     <FormSummaryDetailItem
        label={t("target-label")}
        value={values.targetAddress ? <EvmAddress address={values.targetAddress} /> : "-"}
      />
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={values.underlyingAssetAddress ? <EvmAddress address={values.underlyingAssetAddress} /> : "-"}
      />
      <FormSummaryDetailItem
        label={t("account-label.recipient")}
        value={values.to ? <EvmAddress address={values.to} /> : "-"}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount ?? 0, { locale, decimals, token: tokenSymbol })}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof WithdrawInput)[];
