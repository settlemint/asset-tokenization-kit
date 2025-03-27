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
  const uniqueTypes = Array.from(
    new Set(portfolioStats.map((item) => item.asset.type))
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
    // Configure chart colors for each type
    uniqueTypes.forEach((type, index) => {
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
      const processedData = portfolioStats.map((item) => ({
        timestamp: item.timestamp,
        [item.asset.id]:
          Number(item.balance) *
          (assetPriceMap.get(item.asset.id)?.amount || 0),
      }));

      return createTimeSeries(
        processedData,
        uniqueAssets,
        {
          granularity: "hour",
          intervalType: "day",
          intervalLength: 3,
          aggregation: {
            display: "max",
            storage: "last",
          },
          accumulation: "current",
          historical: true,
        },
        locale
      );
    } else if (aggregationType === "type") {
      // Process data for all types in a single time series
      const processedData = portfolioStats.map((item) => ({
        timestamp: item.timestamp,
        [item.asset.type]:
          Number(item.balance) *
          (assetPriceMap.get(item.asset.id)?.amount || 0),
      }));

      return createTimeSeries(
        processedData,
        uniqueTypes,
        {
          granularity: "hour",
          intervalType: "day",
          intervalLength: 3,
          aggregation: {
            display: "sum",
            storage: "sum",
          },
          accumulation: "current",
          historical: true,
        },
        locale
      );
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
          aggregation: "sum", // Simplified since we don't need different storage behavior
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
            <SelectTrigger>
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
