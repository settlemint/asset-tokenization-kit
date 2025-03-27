"use client";

import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
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
import type { Address } from "viem";
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
    for (const type of uniqueTypes) {
      chartConfig[type] = {
        label: type,
        color: getAssetColor(type, "color"),
      };
    }
  } else {
    chartConfig.total = {
      label: "Total Value",
      color: "var(--chart-1)",
    };
  }

  // Process data based on aggregation type
  const processData = () => {
    // First create individual asset time series
    const individualData = portfolioStats.map((item) => ({
      timestamp: item.timestamp,
      [item.asset.id]:
        Number(item.balance) * (assetPriceMap.get(item.asset.id)?.amount || 0),
    }));

    const individualTimeSeries = createTimeSeries(
      individualData,
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

    if (aggregationType === "individual") {
      return individualTimeSeries;
    } else if (aggregationType === "type") {
      // Create a map of asset id to asset type
      const assetTypeMap = new Map<Address, string>(
        portfolioStats.map((item) => [
          item.asset.id as Address,
          item.asset.type,
        ])
      );

      // Transform individual time series to type-based time series
      return individualTimeSeries.map((row) => {
        const typeValues = new Map<string, number>();

        // For each key in the row (except timestamp), get its type and sum values
        for (const [key, value] of Object.entries(row)) {
          if (key === "timestamp") continue;

          const assetType = assetTypeMap.get(key as Address);
          if (assetType) {
            typeValues.set(
              assetType,
              (typeValues.get(assetType) || 0) + (value as number)
            );
          }
        }

        // Create new row with type-based sums
        return {
          timestamp: row.timestamp,
          ...Object.fromEntries(typeValues.entries()),
        };
      });
    } else {
      // Total value - sum all values for each timestamp
      return individualTimeSeries.map((row) => {
        const total = Object.entries(row).reduce((sum, [key, value]) => {
          return key !== "timestamp" ? sum + (value as number) : sum;
        }, 0);

        return {
          timestamp: row.timestamp,
          total,
        };
      });
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
