"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { formatDate } from "@/lib/utils/date";
import { IntervalPeriod, getIntervalLabel } from "@/lib/utils/yield";
import { Percent } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext();
  const t = useTranslations("admin.bonds.yield.set-schedule");
  const locale = useLocale();
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t("summary.title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("summary.title")}
        description={t("description")}
        icon={<Percent className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("summary.contract-address")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("summary.start-time")}
          value={formatDate(values.startTime, { locale })}
        />
        <FormSummaryDetailItem
          label={t("summary.end-time")}
          value={formatDate(values.endTime, { locale })}
        />
        <FormSummaryDetailItem
          label={t("summary.rate")}
          value={`${values.rate}%`}
        />
        <FormSummaryDetailItem
          label={t("summary.interval")}
          value={getIntervalLabel(values.interval as IntervalPeriod, (key) =>
            t(key)
          )}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
