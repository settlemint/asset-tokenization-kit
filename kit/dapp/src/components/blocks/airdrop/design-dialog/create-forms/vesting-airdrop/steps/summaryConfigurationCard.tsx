"use client";

import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import {
  formatDate,
  formatDuration,
  getTimeUnitSeconds,
} from "@/lib/utils/date";
import { Clock, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
export function VestingAirdropConfigurationCard() {
  const form = useFormContext<CreateVestingAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary");
  const formValues = form.getValues();

  return (
    <div>
      {/* Time Configuration Card */}
      <FormSummaryDetailCard
        title={t("timing.title")}
        description={t("timing.description")}
        icon={<Clock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("timing.end-time-label")}
          value={
            formValues.claimPeriodEnd
              ? formatDate(formValues.claimPeriodEnd)
              : "-"
          }
        />
      </FormSummaryDetailCard>

      {/* Vesting Configuration Card */}
      <FormSummaryDetailCard
        title="Vesting Configuration"
        description="Vesting parameters for the airdrop distribution."
        icon={<Timer className="size-3 text-primary-foreground" />}
      >
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
    </div>
  );
}
