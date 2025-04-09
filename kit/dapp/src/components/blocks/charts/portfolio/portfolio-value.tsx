"use client";

import { formatCompactForYAxis } from "@/app/[locale]/(private)/assets/(dashboard)/_components/utils/format-compact";
import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import { Button } from "@/components/ui/button";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import type {
  PortfolioAsset,
  PortfolioStatsCollection,
} from "@/lib/queries/portfolio/portfolio-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Price } from "@/lib/utils/typebox/price";
import { useTranslations, type Locale } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import {
  TIME_RANGE_CONFIG,
  TimeSeriesChart,
  TimeSeriesControls,
  TimeSeriesRoot,
  TimeSeriesTitle,
  type TimeRange,
} from "../time-series";

interface PortfolioValueProps {
  portfolioStats: PortfolioStatsCollection;
  assetPriceMap: Map<string, Price>;
  locale: Locale;
  maxRange?: TimeRange;
}

type AggregationType = "total" | "stackByType" | "compareTypes";

export function PortfolioValue({
  portfolioStats,
  assetPriceMap,
  locale,
  maxRange = "30d",
}: PortfolioValueProps) {
  const t = useTranslations("components.charts.portfolio");
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("total");
  const AGGREGATION_OPTIONS = [
    { value: "total", label: t("aggregation-options.total-value") },
    {
      value: "stackByType",
      label: t("aggregation-options.stacked-asset-types"),
    },
    {
      value: "compareTypes",
      label: t("aggregation-options.compare-asset-types"),
    },
  ] as const;

  if (!portfolioStats || portfolioStats.length === 0) {
    return (
      <ChartSkeleton title="Portfolio Value" variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("portfolio-value-no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const { uniqueAssets, uniqueTypes, assetMap } = portfolioStats.reduce(
    (acc, item) => {
      acc.uniqueAssets.add(item.asset.id);
      acc.uniqueTypes.add(item.asset.type as AssetType);
      acc.assetMap.set(item.asset.id as Address, item.asset);
      return acc;
    },
    {
      uniqueAssets: new Set<string>(),
      uniqueTypes: new Set<AssetType>(),
      assetMap: new Map<Address, PortfolioAsset>(),
    }
  );

  const chartConfig: ChartConfig = {};
  if (aggregationType === "total") {
    chartConfig.total = {
      label: "Total Value",
      color: "var(--chart-1)",
    };
  } else {
    for (const type of uniqueTypes) {
      chartConfig[type] = {
        label: type,
        color: getAssetColor(type, "color"),
      };
    }
  }
  const individualData = portfolioStats.map((item) => ({
    timestamp: item.timestamp,
    [item.asset.id]:
      Number(item.balance) * (assetPriceMap.get(item.asset.id)?.amount || 0),
  }));

  const individualTimeSeries = (
    data: typeof individualData,
    timeRange: TimeRange,
    locale: Locale
  ) => {
    return createTimeSeries(
      data,
      Array.from(uniqueAssets),
      {
        ...TIME_RANGE_CONFIG[timeRange],
        aggregation: { display: "max", storage: "last" },
        accumulation: "current",
        historical: true,
      },
      locale
    );
  };

  const assetTypeTimeSeries = (
    data: typeof individualData,
    timeRange: TimeRange,
    locale: Locale
  ) => {
    const individualTimeSeriesData = individualTimeSeries(
      data,
      timeRange,
      locale
    );
    return individualTimeSeriesData.map((row) => {
      const typeValues = new Map<AssetType, number>();

      for (const [key, value] of Object.entries(row)) {
        if (key === "timestamp") continue;

        const asset = assetMap.get(key as Address);
        if (asset) {
          const assetType = asset.type;
          typeValues.set(
            assetType,
            (typeValues.get(assetType) || 0) + (Number(value) || 0)
          );
        }
      }

      const assetTypeValues = Object.fromEntries(
        typeValues.entries()
      ) as Record<AssetType, number>;

      return {
        timestamp: row.timestamp,
        ...assetTypeValues,
      };
    });
  };

  const totalValueTimeSeries = (
    data: typeof individualData,
    timeRange: TimeRange,
    locale: Locale
  ) => {
    const individualTimeSeriesData = individualTimeSeries(
      data,
      timeRange,
      locale
    );
    return individualTimeSeriesData.map((row) => ({
      timestamp: row.timestamp,
      total: Object.entries(row).reduce((sum, [key, value]) => {
        return key !== "timestamp" ? sum + (Number(value) || 0) : sum;
      }, 0),
    }));
  };

  // Get currency from the first price object in the map
  const currency =
    assetPriceMap.size > 0
      ? assetPriceMap.values().next().value?.currency
      : undefined;

  // Get a formatter for the Y-axis that uses our compact formatter
  const yAxisTickFormatter = (value: string) => {
    return formatCompactForYAxis(value, locale, currency);
  };

  return (
    <TimeSeriesRoot locale={locale} maxRange={maxRange}>
      <TimeSeriesTitle
        title={t("portfolio-value-title")}
        description={t("portfolio-value-description")}
      />
      <TimeSeriesControls>
        <div className="flex gap-2">
          {AGGREGATION_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() =>
                setAggregationType(option.value as AggregationType)
              }
              variant={aggregationType === option.value ? "default" : "outline"}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </TimeSeriesControls>
      {aggregationType === "total" ? (
        <TimeSeriesChart
          rawData={individualData}
          processData={totalValueTimeSeries}
          config={chartConfig}
          chartContainerClassName="h-[16rem] w-full"
          roundedBars={false}
          yAxisTickFormatter={yAxisTickFormatter}
        />
      ) : aggregationType === "stackByType" ? (
        <TimeSeriesChart
          rawData={individualData}
          processData={assetTypeTimeSeries}
          config={chartConfig}
          chartContainerClassName="h-[16rem] w-full"
          stacked={true}
          roundedBars={false}
          yAxisTickFormatter={yAxisTickFormatter}
        />
      ) : (
        <TimeSeriesChart
          rawData={individualData}
          processData={assetTypeTimeSeries}
          config={chartConfig}
          chartContainerClassName="h-[16rem] w-full"
          stacked={false}
          roundedBars={false}
          chartTooltipCursor={true}
          yAxisTickFormatter={yAxisTickFormatter}
        />
      )}
    </TimeSeriesRoot>
  );
}
