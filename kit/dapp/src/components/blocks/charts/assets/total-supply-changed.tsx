"use client";

import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import {
  TIME_RANGE_CONFIG,
  TimeSeriesChart,
  TimeSeriesRoot,
  TimeSeriesTitle,
  type TimeRange,
} from "@/components/blocks/charts/time-series";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import type { AssetStats } from "@/lib/queries/asset-stats/asset-stats-schema";
import { formatDate } from "@/lib/utils/date";
import { startOfHour } from "date-fns";
import { useTranslations, type Locale } from "next-intl";

interface TotalSupplyChangedProps {
  data: AssetStats[];
  locale: Locale;
  maxRange?: TimeRange;
}

export function TotalSupplyChanged({
  data,
  locale,
  maxRange = "30d",
}: TotalSupplyChangedProps) {
  const t = useTranslations("components.charts.assets");

  const chartConfig = {
    totalMinted: {
      label: t("total-supply-changed.minted-label"),
      color: "var(--chart-1)",
    },
    totalBurned: {
      label: t("total-supply-changed.burned-label"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  if (!data || data.every((d) => d.totalMinted === 0 && d.totalBurned === 0)) {
    return (
      <ChartSkeleton title={t("total-supply-changed.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("total-supply-changed.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const modifiedData = data.map((d) => ({
    ...d,
    totalBurned: d.totalBurned * -1,
  }));

  return (
    <TimeSeriesRoot locale={locale} maxRange={maxRange}>
      <TimeSeriesTitle
        title={t("total-supply-changed.title")}
        description={t("total-supply-changed.description")}
        lastUpdated={formatDate(startOfHour(new Date()), { locale })}
      />
      <TimeSeriesChart
        rawData={modifiedData}
        processData={(rawData, timeRange, locale) => {
          return createTimeSeries(
            rawData,
            ["totalMinted", "totalBurned"],
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
