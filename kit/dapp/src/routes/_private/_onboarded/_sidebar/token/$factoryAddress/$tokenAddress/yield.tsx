import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { SetYieldScheduleSheet } from "@/components/manage-dropdown/sheets/set-yield-schedule-sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils/date";
import { orpc } from "@/orpc/orpc-client";
import type { FixedYieldSchedulePeriod } from "@atk/zod/fixed-yield-schedule";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { Dnum } from "dnum";
import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";
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

const columnHelper = createColumnHelper<FixedYieldSchedulePeriod>();

/**
 * Calculate progress percentage from claimed and total yield amounts
 */
function calculateProgress(claimed: Dnum, total: Dnum): number {
  const claimedNum = Number.parseFloat(claimed.toString());
  const totalNum = Number.parseFloat(total.toString());
  if (totalNum === 0) return 0;
  return Math.min((claimedNum / totalNum) * 100, 100);
}

/**
 * Determine period status based on current date and period dates
 */
function determineStatus(
  startDate: Date,
  endDate: Date
): "scheduled" | "active" | "completed" | "expired" {
  const now = new Date();

  if (now < startDate) {
    return "scheduled";
  } else if (now >= startDate && now <= endDate) {
    return "active";
  } else {
    return "completed";
  }
}

/**
 * Format claimed/total amounts for display
 */
function formatClaimedTotal(
  claimed: Dnum,
  total: Dnum,
  symbol: string
): string {
  const claimedNum = Number.parseFloat(claimed.toString()).toFixed(2);
  const totalNum = Number.parseFloat(total.toString()).toFixed(2);
  return `${claimedNum} / ${totalNum} ${symbol}`;
}

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
  const { asset } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });

  const { t } = useTranslation(["tokens", "common"]);
  const [isYieldScheduleSheetOpen, setIsYieldScheduleSheetOpen] =
    useState(false);

  // Columns definition for periods table
  const periodsColumns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.accessor("startDate", {
          header: t("tokens:yield.periodsTable.columns.startDate"),
          cell: (cellProps) => {
            const timestamp = cellProps.getValue();
            return formatDate(timestamp);
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.startDate"),
            type: "date",
          },
        }),
        columnHelper.accessor("endDate", {
          header: t("tokens:yield.periodsTable.columns.endDate"),
          cell: (cellProps) => {
            const timestamp = cellProps.getValue();
            return formatDate(timestamp);
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.endDate"),
            type: "date",
          },
        }),
        columnHelper.display({
          id: "claimedTotal",
          header: t("tokens:yield.periodsTable.columns.claimedTotal"),
          cell: ({ row }) => {
            return formatClaimedTotal(
              row.original.totalClaimed,
              row.original.totalYield,
              asset.symbol
            );
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.claimedTotal"),
            type: "text",
          },
        }),
        columnHelper.display({
          id: "progress",
          header: t("tokens:yield.periodsTable.columns.progress"),
          cell: ({ row }) => {
            const progress = calculateProgress(
              row.original.totalClaimed,
              row.original.totalYield
            );
            return (
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-16 h-2" />
                <span className="text-sm text-muted-foreground">
                  {progress.toFixed(1)}%
                </span>
              </div>
            );
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.progress"),
            type: "progress",
          },
        }),
        columnHelper.display({
          id: "status",
          header: t("tokens:yield.periodsTable.columns.status"),
          cell: ({ row }) => {
            const status = determineStatus(
              row.original.startDate,
              row.original.endDate
            );
            return (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {t(`tokens:yield.periodsTable.status.${status}`)}
              </span>
            );
          },
          meta: {
            displayName: t("tokens:yield.periodsTable.columns.status"),
            type: "badge",
          },
        }),
      ] as ColumnDef<FixedYieldSchedulePeriod>[]),
    [t, asset.symbol]
  );

  // Check if token has a yield schedule configured
  const yieldScheduleId = asset.yield?.schedule?.id;

  // Fetch yield schedule details if available
  const { data: yieldSchedule, isLoading } = useQuery({
    ...orpc.fixedYieldSchedule.read.queryOptions({
      input: { id: yieldScheduleId ?? "" },
    }),
    enabled: !!yieldScheduleId,
  });

  // If asset is not loaded yet, show loading state
  if (!asset) {
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

  // Show loading state
  if (isLoading) {
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

  // Show empty state if no yield schedule exists
  if (!yieldScheduleId || !yieldSchedule) {
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

  // Helper function to format interval from seconds to readable format
  const formatInterval = (seconds: string) => {
    const secondsNum = Number.parseInt(seconds, 10);
    const days = Math.floor(secondsNum / 86_400);

    if (days === 30 || days === 31) return t("tokens:yield.intervals.monthly");
    if (days === 365) return t("tokens:yield.intervals.yearly");
    if (days === 90 || days === 91)
      return t("tokens:yield.intervals.quarterly");
    if (days % 7 === 0) {
      const weeks = days / 7;
      return t("tokens:yield.intervals.weeks", { count: weeks });
    }
    return t("tokens:yield.intervals.days", { count: days });
  };

  // Helper function to format rate from basis points to percentage
  const formatRate = (basisPoints: string) => {
    const rate = Number.parseInt(basisPoints, 10) / 100;
    return `${rate}%`;
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
          value={formatRate(yieldSchedule.rate)}
          type="text"
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
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-medium text-accent">
              {t("tokens:yield.periodsTable.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("tokens:yield.periodsTable.description")}
            </p>
          </div>
          <DataTable
            name="yield-periods"
            data={yieldSchedule.periods}
            columns={periodsColumns}
            urlState={{
              enabled: false,
              enableUrlPersistence: false,
              enableRowSelection: false,
              defaultPageSize: 10,
            }}
            advancedToolbar={{
              enableGlobalSearch: true,
              enableFilters: true,
              enableExport: false,
              enableViewOptions: false,
            }}
          />
        </div>
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
