"use client";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import {
  TIME_RANGE_CONFIG,
  TimeSeriesChart,
  TimeSeriesRoot,
  TimeSeriesTitle,
  type TimeRange,
} from "@/components/blocks/charts/time-series";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartColumnIncreasingIcon } from "@/components/ui/chart-column-increasing";
import { createTimeSeries } from "@/lib/charts";
import type { AssetStats } from "@/lib/queries/asset-stats/asset-stats-schema";
import { formatDate } from "@/lib/utils/date";
import { startOfHour } from "date-fns";
import { useTranslations, type Locale } from "next-intl";
interface TotalVolumeProps {
  data: AssetStats[];
  locale: Locale;
  maxRange?: TimeRange;
}

export function TotalVolume({
  data,
  locale,
  maxRange = "30d",
}: TotalVolumeProps) {
  const t = useTranslations("components.charts.assets");

  const chartConfig = {
    totalVolume: {
      label: t("total-volume.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (!data || data.every((d) => d.totalVolume === 0)) {
    return (
      <ChartSkeleton title={t("total-volume.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("total-volume.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  return (
    <TimeSeriesRoot locale={locale} maxRange={maxRange}>
      <TimeSeriesTitle
        title={t("total-volume.title")}
        description={t("total-volume.description")}
        lastUpdated={formatDate(startOfHour(new Date()), { locale })}
      />
      <TimeSeriesChart
        rawData={data}
        processData={(rawData, timeRange, locale) => {
          return createTimeSeries(
            rawData,
            ["totalVolume"],
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
