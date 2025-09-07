import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { SetYieldScheduleSheet } from "@/components/manage-dropdown/sheets/set-yield-schedule-sheet";
import { FixedYieldSchedulePeriodsTable } from "@/components/tables/fixed-yield-schedule-periods";
import { Button } from "@/components/ui/button";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for token yield details page
 *
 * This route displays yield schedule information for a specific token.
 * It shows either the configured yield schedule details or an empty state
 * prompting the user to set up a yield schedule.
 *
 * Route path: `/token/{factoryAddress}/{tokenAddress}/yield`
 *
 * @remarks
 * - Only available for bond tokens that support yield functionality
 * - Fetches yield schedule details if configured
 * - Shows empty state with setup button if no schedule exists
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/yield"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token yield details page component
 *
 * Displays comprehensive yield schedule information including:
 * - Schedule configuration (start/end dates, rate, interval)
 * - Yield tracking (total, claimed, unclaimed amounts)
 * - Period management (current and next periods)
 * - Empty state for tokens without yield schedules
 */
function RouteComponent() {
  const { asset } = useTokenLoaderQuery();

  const { t } = useTranslation(["tokens", "common"]);
  const [isYieldScheduleSheetOpen, setIsYieldScheduleSheetOpen] =
    useState(false);

  // Check if token has a yield schedule configured
  const yieldScheduleId = asset.yield?.schedule?.id;

  // Fetch yield schedule details if available
  const { data: yieldSchedule } = useQuery({
    ...orpc.fixedYieldSchedule.read.queryOptions({
      input: { id: yieldScheduleId ?? "" },
    }),
    enabled: !!yieldScheduleId,
  });

  // Fetch denomination asset details when available
  const denominationAssetId = yieldSchedule?.denominationAsset?.id;
  const { data: denominationAsset } = useQuery({
    ...orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetId ?? "" },
    }),
    enabled: !!denominationAssetId,
  });

  // Fetch yield schedule's denomination asset balance
  const { data: yieldScheduleBalance } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: yieldSchedule?.denominationAsset?.id ?? "",
        holderAddress: yieldSchedule?.id ?? "",
      },
    }),
    enabled: !!yieldSchedule,
  });

  // Show empty state if no yield schedule exists
  if (!yieldScheduleId) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t("tokens:yield.emptyState.title")}
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {t("tokens:yield.emptyState.description")}
          </p>
          <Button
            onClick={() => {
              setIsYieldScheduleSheetOpen(true);
            }}
          >
            {t("tokens:yield.emptyState.setScheduleButton")}
          </Button>
        </div>

        {/* Set Yield Schedule Sheet */}
        <SetYieldScheduleSheet
          open={isYieldScheduleSheetOpen}
          onOpenChange={setIsYieldScheduleSheetOpen}
          asset={asset}
        />
      </>
    );
  }

  // Show loading state
  if (!yieldSchedule) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format interval from seconds to readable format
  const formatInterval = (seconds: string) => {
    const secondsNum = Number.parseInt(seconds, 10);
    const days = Math.floor(secondsNum / 86_400);

    if (days === 30 || days === 31) return t("common:timeInterval.MONTHLY");
    if (days === 365) return t("common:timeInterval.YEARLY");
    if (days === 90 || days === 91) return t("common:timeInterval.QUARTERLY");
    if (days % 7 === 0) {
      const weeks = days / 7;
      return t("common:timeInterval.WEEKLY", { count: weeks });
    }
    return t("common:timeInterval.DAILY", { count: days });
  };

  return (
    <>
      <DetailGrid title={t("tokens:yield.scheduleConfiguration")}>
        <DetailGridItem
          label={t("tokens:yield.fields.startDate")}
          info={t("tokens:yield.fields.startDateInfo")}
          value={yieldSchedule.startDate}
          type="date"
        />
        <DetailGridItem
          label={t("tokens:yield.fields.endDate")}
          info={t("tokens:yield.fields.endDateInfo")}
          value={yieldSchedule.endDate}
          type="date"
        />
        <DetailGridItem
          label={t("tokens:yield.fields.rate")}
          info={t("tokens:yield.fields.rateInfo")}
          value={yieldSchedule.rate}
          type="basisPoints"
        />
        <DetailGridItem
          label={t("tokens:yield.fields.interval")}
          info={t("tokens:yield.fields.intervalInfo")}
          value={formatInterval(yieldSchedule.interval)}
          type="text"
        />
        {yieldSchedule.periods && yieldSchedule.periods.length > 0 && (
          <DetailGridItem
            label={t("tokens:yield.fields.totalPeriods")}
            info={t("tokens:yield.fields.totalPeriodsInfo")}
            value={yieldSchedule.periods.length}
            type="number"
          />
        )}
      </DetailGrid>

      <DetailGrid title={t("tokens:yield.yieldTracking")}>
        <DetailGridItem
          label={t("tokens:yield.fields.totalYield")}
          info={t("tokens:yield.fields.totalYieldInfo")}
          value={yieldSchedule.totalYield}
          type="currency"
          currency={{ assetSymbol: asset.symbol }}
        />
        <DetailGridItem
          label={t("tokens:yield.fields.totalClaimed")}
          info={t("tokens:yield.fields.totalClaimedInfo")}
          value={yieldSchedule.totalClaimed}
          type="currency"
          currency={{ assetSymbol: asset.symbol }}
        />
        <DetailGridItem
          label={t("tokens:yield.fields.totalUnclaimed")}
          info={t("tokens:yield.fields.totalUnclaimedInfo")}
          value={yieldSchedule.totalUnclaimedYield}
          type="currency"
          currency={{ assetSymbol: asset.symbol }}
        />
        <DetailGridItem
          label={t("tokens:yield.fields.denominationAsset")}
          info={t("tokens:yield.fields.denominationAssetInfo")}
          value={yieldSchedule.denominationAsset.id}
          type="address"
        />
        <DetailGridItem
          label={t("tokens:yield.fields.denominationAssetBalance")}
          info={t("tokens:yield.fields.denominationAssetBalanceInfo")}
          value={yieldScheduleBalance?.holder?.available}
          type="currency"
          currency={{ assetSymbol: denominationAsset?.symbol ?? "" }}
        />
      </DetailGrid>

      {yieldSchedule.currentPeriod && (
        <DetailGrid title={t("tokens:yield.currentPeriod")}>
          <DetailGridItem
            label={t("tokens:yield.fields.periodStart")}
            info={t("tokens:yield.fields.periodStartInfo")}
            value={yieldSchedule.currentPeriod.startDate}
            type="date"
          />
          <DetailGridItem
            label={t("tokens:yield.fields.periodEnd")}
            info={t("tokens:yield.fields.periodEndInfo")}
            value={yieldSchedule.currentPeriod.endDate}
            type="date"
          />
          <DetailGridItem
            label={t("tokens:yield.fields.periodYield")}
            info={t("tokens:yield.fields.periodYieldInfo")}
            value={yieldSchedule.currentPeriod.totalYield}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
          <DetailGridItem
            label={t("tokens:yield.fields.periodClaimed")}
            info={t("tokens:yield.fields.periodClaimedInfo")}
            value={yieldSchedule.currentPeriod.totalClaimed}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
        </DetailGrid>
      )}

      {yieldSchedule.nextPeriod && (
        <DetailGrid title={t("tokens:yield.nextPeriod")}>
          <DetailGridItem
            label={t("tokens:yield.fields.periodStart")}
            info={t("tokens:yield.fields.periodStartInfo")}
            value={yieldSchedule.nextPeriod.startDate}
            type="date"
          />
          <DetailGridItem
            label={t("tokens:yield.fields.periodEnd")}
            info={t("tokens:yield.fields.periodEndInfo")}
            value={yieldSchedule.nextPeriod.endDate}
            type="date"
          />
          <DetailGridItem
            label={t("tokens:yield.fields.periodYield")}
            info={t("tokens:yield.fields.periodYieldInfo")}
            value={yieldSchedule.nextPeriod.totalYield}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
        </DetailGrid>
      )}

      {yieldSchedule.periods && yieldSchedule.periods.length > 0 && (
        <FixedYieldSchedulePeriodsTable
          periods={yieldSchedule.periods}
          assetSymbol={asset.symbol}
        />
      )}

      {/* Set Yield Schedule Sheet */}
      <SetYieldScheduleSheet
        open={isYieldScheduleSheetOpen}
        onOpenChange={setIsYieldScheduleSheetOpen}
        asset={asset}
      />
    </>
  );
}
