"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<TopUpInput>();
  const t = useTranslations("admin.bonds.top-up-form.steps.summary");
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        icon={<DollarSign className="size-3 text-primary-foreground" />}
        title={t("title")}
        description={t("description")}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={values.underlyingAssetAddress!} />}
        />
        <FormSummaryDetailItem
          label={t("amount-label")}
          value={formatNumber(values.amount ?? 0)}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode"] as const;