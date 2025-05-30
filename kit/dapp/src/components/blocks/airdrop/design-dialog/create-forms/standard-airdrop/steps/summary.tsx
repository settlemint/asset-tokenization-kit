"use client";

import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/standard/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/standard/predict-address";
import { formatDate } from "@/lib/utils/date";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Summary as BaseSummary } from "../../common/summary";

export function Summary() {
  const form = useFormContext<CreateStandardAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary");
  const formValues = form.getValues();

  return (
    <BaseSummary
      predictAddress={getPredictedAddress}
      isAddressAvailable={isAddressAvailable}
    >
      {/* Time Configuration Card */}
      <FormSummaryDetailCard
        title={t("timing.title")}
        description={t("timing.description")}
        icon={<Clock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("timing.start-time-label")}
          value={
            formValues.startTime
              ? formatDate(formValues.startTime)
              : t("not-specified")
          }
        />
        <FormSummaryDetailItem
          label={t("timing.end-time-label")}
          value={
            formValues.endTime
              ? formatDate(formValues.endTime)
              : t("not-specified")
          }
        />
      </FormSummaryDetailCard>
    </BaseSummary>
  );
}
