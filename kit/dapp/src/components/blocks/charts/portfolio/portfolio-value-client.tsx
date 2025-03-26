"use client";

import type { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTimeSeries } from "@/lib/charts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AreaChartComponent } from "../area-chart";

interface TimeseriesEntry {
  timestamp: string;
  [key: string]: string | number;
}

interface PortfolioValueClientProps {
  portfolioHistory: {
    timestamp: string;
    balance: string;
    asset: {
      id: string;
      name: string;
      type: string;
    };
  }[];
  assetPriceMap: Map<string, number>;
}

type AggregationType = "individual" | "type" | "total";

const AGGREGATION_OPTIONS = [
  { value: "individual", label: "By Asset" },
  { value: "type", label: "By Asset Type" },
  { value: "total", label: "Total Value" },
] as const;

export function PortfolioValueClient({
  portfolioHistory,
  assetPriceMap,
}: PortfolioValueClientProps) {
  const t = useTranslations("components.charts.portfolio");
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("individual");

  // Get unique assets and their types
  const uniqueAssets = Array.from(
    new Set(portfolioHistory.map((item) => item.asset.id))
  );
  const uniqueAssetTypes = Array.from(
    new Set(portfolioHistory.map((item) => item.asset.type))
  );

  // Create chart config based on aggregation type
  const chartConfig: ChartConfig = {};
  if (aggregationType === "individual") {
    uniqueAssets.forEach((assetId, index) => {
      const asset = portfolioHistory.find(
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
    uniqueAssetTypes.forEach((type, index) => {
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
        const assetHistory = portfolioHistory.filter(
          (item) => item.asset.id === assetId
        );

        const processedData: TimeseriesEntry[] = assetHistory.map((item) => ({
          timestamp: item.timestamp,
          [assetId]:
            Number(item.balance) * (assetPriceMap.get(item.asset.id) || 0),
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
          "en"
        );
      });

      // Combine all time series data
      const allTimestamps = new Set<string>();
      timeseriesPerAsset.forEach((series) => {
        series.forEach((item) => allTimestamps.add(item.timestamp));
      });

      return Array.from(allTimestamps)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((timestamp) => {
          const entry: TimeseriesEntry = {
            timestamp,
            ...Object.fromEntries(uniqueAssets.map((id) => [id, 0])),
          };

          timeseriesPerAsset.forEach((series) => {
            const dataPoint = series.find(
              (item) => item.timestamp === timestamp
            );
            if (dataPoint) {
              Object.entries(dataPoint).forEach(([key, value]) => {
                if (key !== "timestamp") {
                  entry[key] = value as number;
                }
              });
            }
          });

          return entry;
        });
    } else if (aggregationType === "type") {
      const timeseriesPerType = uniqueAssetTypes.map((type) => {
        const typeHistory = portfolioHistory.filter(
          (item) => item.asset.type === type
        );

        const processedData: TimeseriesEntry[] = typeHistory.map((item) => ({
          timestamp: item.timestamp,
          [type]:
            Number(item.balance) * (assetPriceMap.get(item.asset.id) || 0),
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
          "en"
        );
      });

      // Combine all time series data
      const allTimestamps = new Set<string>();
      timeseriesPerType.forEach((series) => {
        series.forEach((item) => allTimestamps.add(item.timestamp));
      });

      return Array.from(allTimestamps)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((timestamp) => {
          const entry: TimeseriesEntry = {
            timestamp,
            ...Object.fromEntries(uniqueAssetTypes.map((type) => [type, 0])),
          };

          timeseriesPerType.forEach((series) => {
            const dataPoint = series.find(
              (item) => item.timestamp === timestamp
            );
            if (dataPoint) {
              Object.entries(dataPoint).forEach(([key, value]) => {
                if (key !== "timestamp") {
                  entry[key] = value as number;
                }
              });
            }
          });

          return entry;
        });
    } else {
      // Total value
      const processedData: TimeseriesEntry[] = portfolioHistory.map((item) => ({
        timestamp: item.timestamp,
        total: Number(item.balance) * (assetPriceMap.get(item.asset.id) || 0),
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
        "en"
      );
    }
  };

  const timeseries = processData();

  return (
    <div className="space-y-4">
      <AreaChartComponent
        data={timeseries}
        config={chartConfig}
        title={
          <div className="flex items-center justify-between w-full space-x-4">
            <span>{t("portfolio-value-title")}</span>

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
          </div>
        }
        description={t("portfolio-value-description")}
        xAxis={{ key: "timestamp" }}
        showYAxis={true}
        stacked={aggregationType !== "individual"}
        info={`Last updated: ${timeseries.at(-1)?.timestamp}`}
        chartContainerClassName="h-[14rem] w-full"
      />
    </div>
  );
}
