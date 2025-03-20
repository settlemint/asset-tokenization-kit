"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { UnblockUserInput } from "@/lib/mutations/unblock-user/unblock-user-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("private.assets.details.forms");
  const { getValues } = useFormContext<UnblockUserInput>();
  const { userAddress, address } = getValues();

  return (
    <FormStep
      title={t("summary.title.unblock")}
      description={t("summary.description.unblock")}
    >
      <FormSummaryDetailItem
        label={t("summary.asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("summary.account-label.default")}
        value={<EvmAddress address={userAddress} />}
      />
    </FormStep>
  );
}
