"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { authClient } from "@/lib/auth/client";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import {
  formatDate,
  formatDuration,
  getTimeUnitSeconds,
} from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { Clock, HandHeart, Settings, Timer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const form = useFormContext<CreateVestingAirdropInput>();
  const t = useTranslations("private.airdrops.create.summary");
  const locale = useLocale();
  const formValues = form.getValues();
  const { data: session } = authClient.useSession();

  return (
    <StepContent className="max-w-3xl w-full mx-auto">
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        {/* Basic Information Card */}
        <FormSummaryDetailCard
          title={t("basics.title")}
          description={t("basics.description")}
          icon={<Settings className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("basics.asset-label")}
            value={
              formValues.asset ? (
                <EvmAddress
                  address={formValues.asset.id}
                  symbol={formValues.asset.symbol}
                />
              ) : undefined
            }
          />
          <FormSummaryDetailItem
            label={t("basics.owner-label")}
            value={
              <EvmAddress
                address={formValues.owner}
                name={
                  session?.user?.wallet === formValues.owner
                    ? session.user.name
                    : undefined
                }
                hoverCard={false}
              />
            }
          />
        </FormSummaryDetailCard>

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

        {/* Distribution Configuration Card */}
        <FormSummaryDetailCard
          title={t("configuration.title")}
          description={t("configuration.description")}
          icon={<HandHeart className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("configuration.distribution-recipients-label")}
            value={formValues.distribution?.length?.toString()}
          />
          <FormSummaryDetailItem
            label={t("configuration.total-distribution-amount-label")}
            value={
              formValues.distribution
                ? formatNumber(
                    formValues.distribution.reduce(
                      (sum, item) => sum + Number(item.amount),
                      0
                    ),
                    {
                      decimals: formValues.asset?.decimals,
                      token: formValues.asset?.symbol,
                      locale,
                    }
                  )
                : "-"
            }
          />
        </FormSummaryDetailCard>

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-8">
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </StepContent>
  );
}
