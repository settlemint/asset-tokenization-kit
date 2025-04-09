"use client";

import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import type { AssetStats } from "@/lib/queries/asset-stats/asset-stats-schema";
import { formatDate } from "@/lib/utils/date";
import { startOfHour } from "date-fns";
import { useTranslations, type Locale } from "next-intl";
import {
  TIME_RANGE_CONFIG,
  TimeSeriesChart,
  TimeSeriesRoot,
  TimeSeriesTitle,
  type TimeRange,
} from "../time-series";

interface TotalTransfersProps {
  data: AssetStats[];
  locale: Locale;
  maxRange?: TimeRange;
}

export function TotalTransfers({
  data,
  locale,
  maxRange = "30d",
}: TotalTransfersProps) {
  const t = useTranslations("components.charts.assets");

  const chartConfig = {
    totalTransfers: {
      label: t("total-transfers.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (!data || data.every((d) => d.totalTransfers === 0)) {
    return (
      <ChartSkeleton title={t("total-transfers.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("total-transfers.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  return (
    <TimeSeriesRoot locale={locale} maxRange={maxRange}>
      <TimeSeriesTitle
        title={t("total-transfers.title")}
        description={t("total-transfers.description")}
        lastUpdated={formatDate(startOfHour(new Date()), { locale })}
      />
      <TimeSeriesChart
        rawData={data}
        processData={(rawData, timeRange, locale) => {
          return createTimeSeries(
            rawData,
            ["totalTransfers"],
            {
              ...TIME_RANGE_CONFIG[timeRange],
              aggregation: "first",
            },
            locale
          );
        }}
        config={chartConfig}
        roundedBars={false}
      />
    </TimeSeriesRoot>
  );
}
