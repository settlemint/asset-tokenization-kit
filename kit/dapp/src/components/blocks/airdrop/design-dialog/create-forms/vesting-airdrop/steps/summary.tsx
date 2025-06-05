"use client";

import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/vesting/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/vesting/predict-address";
import {
  formatDate,
  formatDuration,
  getTimeUnitSeconds,
} from "@/lib/utils/date";
import { Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Summary as BaseSummary } from "../../common/summary";
export function Summary() {
  const form = useFormContext<CreateVestingAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary");
  const formValues = form.getValues();

  return (
    <BaseSummary
      predictAddress={getPredictedAddress}
      isAddressAvailable={isAddressAvailable}
    >
      {/* Vesting Configuration Card */}
      <FormSummaryDetailCard
        title="Vesting Configuration"
        description="Vesting parameters for the airdrop distribution."
        icon={<Timer className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label="Claim Period End"
          value={
            formValues.claimPeriodEnd
              ? formatDate(formValues.claimPeriodEnd)
              : "-"
          }
        />
        <FormSummaryDetailItem
          label="Cliff Duration"
          value={
            formValues.cliffDuration
              ? formatDuration(
                  getTimeUnitSeconds(
                    formValues.cliffDuration.value,
                    formValues.cliffDuration.unit
                  )
                )
              : "-"
          }
        />
        <FormSummaryDetailItem
          label="Vesting Duration"
          value={
            formValues.vestingDuration
              ? formatDuration(
                  getTimeUnitSeconds(
                    formValues.vestingDuration.value,
                    formValues.vestingDuration.unit
                  )
                )
              : "-"
          }
        />
      </FormSummaryDetailCard>
    </BaseSummary>
  );
}
