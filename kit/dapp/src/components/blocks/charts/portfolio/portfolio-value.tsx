"use client";

import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTimeSeries } from "@/lib/charts";
import type { PortfolioStatsCollection } from "@/lib/queries/portfolio/portfolio-schema";
import { assetTypes } from "@/lib/utils/typebox/asset-types";
import type { Price } from "@/lib/utils/typebox/price";
import { useTranslations, type Locale } from "next-intl";
import { useState } from "react";
import { AreaChartComponent } from "../area-chart";

interface PortfolioValueProps {
  portfolioStats: PortfolioStatsCollection;
  assetPriceMap: Map<string, Price>;
  locale: Locale;
}

type AggregationType = "individual" | "type" | "total";

export function PortfolioValue({
  portfolioStats,
  assetPriceMap,
  locale,
}: PortfolioValueProps) {
  const t = useTranslations("components.charts.portfolio");
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("individual");

  const AGGREGATION_OPTIONS = [
    { value: "individual", label: t("aggregation-options.by-asset") },
    { value: "type", label: t("aggregation-options.by-type") },
    { value: "total", label: t("aggregation-options.total") },
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

  // Get unique assets and their types
  const uniqueAssets = Array.from(
    new Set(portfolioStats.map((item) => item.asset.id))
  );

  // Create chart config based on aggregation type
  const chartConfig: ChartConfig = {};
  if (aggregationType === "individual") {
    uniqueAssets.forEach((assetId, index) => {
      const asset = portfolioStats.find(
        (item) => item.asset.id === assetId
      )?.asset;
      if (asset) {
        chartConfig[assetId] = {
          label: asset.name,
          color: `var(--chart-${(index % 6) + 1})`,
        };
      }
    });
  } else if (aggregationType === "type") {
    assetTypes.forEach((type, index) => {
      chartConfig[type] = {
        label: type,
        color: `var(--chart-${(index % 6) + 1})`,
      };
    });
  } else {
    chartConfig.total = {
      label: "Total Value",
      color: "var(--chart-1)",
    };
  }

  // Process data based on aggregation type
  const processData = () => {
    if (aggregationType === "individual") {
      const timeseriesPerAsset = uniqueAssets.map((assetId) => {
        const assetHistory = portfolioStats.filter(
          (item) => item.asset.id === assetId
        );

        const processedData = assetHistory.map((item) => ({
          timestamp: item.timestamp,
          [assetId]:
            Number(item.balance) *
            (assetPriceMap.get(item.asset.id)?.amount || 0),
        }));

        return createTimeSeries(
          processedData,
          [assetId],
          {
            granularity: "day",
            intervalType: "month",
            intervalLength: 1,
            accumulation: "max",
            aggregation: "first",
            historical: true,
          },
          locale
        );
      });

      // Combine all time series data using a Map
      const timeseriesMap = new Map<string, Record<string, number>>();

      // Process each asset's time series
      for (const series of timeseriesPerAsset) {
        for (const item of series) {
          // Get or create values for this timestamp
          const timestampValues = timeseriesMap.get(item.timestamp) || {
            ...Object.fromEntries(uniqueAssets.map((id) => [id, 0])),
          };

          // Update values for this timestamp
          for (const [key, value] of Object.entries(item)) {
            timestampValues[key] = Number(value);
          }

          timeseriesMap.set(item.timestamp, timestampValues);
        }
      }

      // Convert map to sorted array
      const entries = Array.from(timeseriesMap.entries());
      entries.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

      return entries.map(([timestamp, values]) => ({
        timestamp,
        ...values,
      }));
    } else if (aggregationType === "type") {
      const timeseriesPerType = assetTypes.map((type) => {
        const typeHistory = portfolioStats.filter(
          (item) => item.asset.type === type
        );

        const processedData = typeHistory.map((item) => ({
          timestamp: item.timestamp,
          [type]:
            Number(item.balance) *
            (assetPriceMap.get(item.asset.id)?.amount || 0),
        }));

        return createTimeSeries(
          processedData,
          [type],
          {
            granularity: "day",
            intervalType: "month",
            intervalLength: 1,
            accumulation: "max",
            aggregation: "sum",
            historical: true,
          },
          locale
        );
      });

      // Combine all time series data using a Map
      const timeseriesMap = new Map<string, Record<string, number>>();

      // Process each type's time series
      for (const series of timeseriesPerType) {
        for (const item of series) {
          // Get or create values for this timestamp
          const timestampValues = timeseriesMap.get(item.timestamp) || {
            ...Object.fromEntries(assetTypes.map((type) => [type, 0])),
          };

          // Update values for this timestamp
          for (const [key, value] of Object.entries(item)) {
            timestampValues[key] = Number(value);
          }

          timeseriesMap.set(item.timestamp, timestampValues);
        }
      }

      // Convert map to sorted array
      const entries = Array.from(timeseriesMap.entries());
      entries.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

      return entries.map(([timestamp, values]) => ({
        timestamp,
        ...values,
      }));
    } else {
      // Total value
      const processedData = portfolioStats.map((item) => ({
        timestamp: item.timestamp,
        total:
          Number(item.balance) *
          (assetPriceMap.get(item.asset.id)?.amount || 0),
      }));

      return createTimeSeries(
        processedData,
        ["total"],
        {
          granularity: "day",
          intervalType: "month",
          intervalLength: 1,
          accumulation: "max",
          aggregation: "sum",
          historical: true,
        },
        locale
      );
    }
  };

  const timeseries = processData();

  return (
    <div className="space-y-4">
      <AreaChartComponent
        data={timeseries}
        config={chartConfig}
        title={t("portfolio-value-title")}
        description={t("portfolio-value-description")}
        xAxis={{ key: "timestamp" }}
        showYAxis={true}
        stacked={aggregationType !== "individual"}
        info={`Last updated: ${timeseries.at(-1)?.timestamp}`}
        chartContainerClassName="h-[14rem] w-full"
        options={
          <Select
            value={aggregationType}
            onValueChange={(value) =>
              setAggregationType(value as AggregationType)
            }
          >
            <SelectTrigger className="bg-background border-input hover:bg-accent">
              <SelectValue placeholder="View by" defaultValue="individual" />
            </SelectTrigger>
            <SelectContent>
              {AGGREGATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
