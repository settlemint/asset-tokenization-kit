"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = useWatch({
    control: control,
  });
  const locale = useLocale();

  // Determine which asset address to show based on target
  const targetAddress = values.target === "bond"
    ? values.address
    : values.yieldScheduleAddress;

  // Determine which asset address to show based on target
  const assetAddress = values.target === "bond"
    ? values.underlyingAssetAddress
    : values.yieldUnderlyingAssetAddress;

  return (
    <FormStep
      title={t("title.withdraw")}
      description={t("description.withdraw")}
    >
      <FormSummaryDetailItem
        label={t("target-label")}
        value={<EvmAddress address={targetAddress ?? "0x0"} />}
      />
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={assetAddress ?? "0x0"} />}
      />
      <FormSummaryDetailItem
        label={t("account-label.recipient")}
        value={<EvmAddress address={values.to ?? "0x0"} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount ?? 0, { locale })}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
