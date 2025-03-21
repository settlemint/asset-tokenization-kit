"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<TopUpInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = useWatch({
    control: control,
  });
  const locale = useLocale();

  return (
    <FormStep title={t("title.top-up")} description={t("description.top-up")}>
      <FormSummaryDetailItem
        label={t("target-label")}
        value={<EvmAddress address={(values.target === "bond" ? values.address : values.yieldScheduleAddress) ?? "0x0"} />}
      />
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={(values.target === "bond" ? values.underlyingAssetAddress : values.yieldUnderlyingAssetAddress ?? "0x0") ?? "0x0"} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount ?? 0, { locale })}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
