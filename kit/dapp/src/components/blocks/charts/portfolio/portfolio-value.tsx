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
import type {
  PortfolioAsset,
  PortfolioStatsCollection,
} from "@/lib/queries/portfolio/portfolio-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
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
  if (aggregationType === "individual") {
    Array.from(uniqueAssets).forEach((assetId, index) => {
      const asset = assetMap.get(assetId as Address);
      if (asset) {
        chartConfig[assetId] = {
          label: asset.name,
          color: `var(--chart-${(index % 6) + 1})`,
        };
      }
    });
  } else if (aggregationType === "type") {
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

  const processData = () => {
    const individualData = portfolioStats.map((item) => ({
      timestamp: item.timestamp,
      [item.asset.id]:
        Number(item.balance) * (assetPriceMap.get(item.asset.id)?.amount || 0),
    }));

    const individualTimeSeries = createTimeSeries(
      individualData,
      Array.from(uniqueAssets),
      {
        granularity: "day",
        intervalType: "month",
        intervalLength: 1,
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
      return individualTimeSeries.map((row) => {
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

        return {
          timestamp: row.timestamp,
          ...Object.fromEntries(typeValues.entries()),
        };
      });
    } else {
      return individualTimeSeries.map((row) => {
        const total = Object.entries(row).reduce((sum, [key, value]) => {
          return key !== "timestamp" ? sum + (Number(value) || 0) : sum;
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
        stacked={true}
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
