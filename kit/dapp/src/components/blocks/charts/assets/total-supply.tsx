"use client";

import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import {
  TimeSeriesChart,
  TimeSeriesRoot,
  TimeSeriesTitle,
} from "@/components/blocks/charts/time-series";
import { TIME_RANGE_CONFIG } from "@/components/blocks/charts/time-series/index";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import type { AssetStats } from "@/lib/queries/asset-stats/asset-stats-schema";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { startOfHour } from "date-fns";
import { useTranslations, type Locale } from "next-intl";

interface TotalSupplyProps {
  data: AssetStats[];
  locale: Locale;
  interval?: "day" | "week" | "month" | "year";
  size?: "small" | "large";
}

export function TotalSupply({
  data,
  locale,
  size = "small",
}: TotalSupplyProps) {
  const t = useTranslations("components.charts.assets");

  if (!data || data.every((d) => d.totalSupply === 0)) {
    return (
      <ChartSkeleton title={t("total-supply.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("total-supply.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const chartConfig = {
    totalSupply: {
      label: t("total-supply.label"),
      color: "var(--chart-1)",
    },
    ...(["stablecoin", "tokenizeddeposit"].includes(
      data.at(0)?.assetType as AssetType
    )
      ? {
          totalCollateral: {
            label: t("total-collateral.label"),
            color: "var(--chart-2)",
          },
        }
      : {}),
  } satisfies ChartConfig;

  return (
    <TimeSeriesRoot locale={locale} className={cn(size === "large" && "mb-4")}>
      <TimeSeriesTitle
        title={t("total-supply.title")}
        description={t("total-supply.description")}
        lastUpdated={formatDate(startOfHour(new Date()))}
      />
      <TimeSeriesChart
        rawData={data}
        processData={(rawData, timeRange, locale) => {
          return createTimeSeries(
            rawData,
            [
              "totalSupply",
              ...(["stablecoin", "tokenizeddeposit"].includes(
                data.at(0)?.assetType as AssetType
              )
                ? (["totalCollateral"] as const)
                : []),
            ],
            {
              ...TIME_RANGE_CONFIG[timeRange],
              accumulation: "max",
              aggregation: "first",
              historical: true,
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
