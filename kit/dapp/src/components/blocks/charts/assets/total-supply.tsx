import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TotalSupplyProps {
  address: Address;
  interval?: "day" | "week" | "month" | "year";
  size?: "small" | "large";
}

const INTERVAL_MAP = {
  day: {
    granularity: "hour",
    intervalType: "day",
    intervalLength: 1,
  },
  week: {
    granularity: "day",
    intervalType: "week",
    intervalLength: 1,
  },
  month: {
    granularity: "day",
    intervalType: "month",
    intervalLength: 1,
  },
  year: {
    granularity: "month",
    intervalType: "month",
    intervalLength: 12,
  },
} as const;

export async function TotalSupply({
  address,
  interval = "week",
  size = "small",
}: TotalSupplyProps) {
  const t = await getTranslations("components.charts.assets");

  const data = await getAssetStats({ address });

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

  const locale = await getLocale();

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

  const timeseries = createTimeSeries(
    data,
    [
      "totalSupply",
      ...(["stablecoin", "tokenizeddeposit"].includes(
        data.at(0)?.assetType as AssetType
      )
        ? (["totalCollateral"] as const)
        : []),
    ],
    {
      granularity: INTERVAL_MAP[interval].granularity,
      intervalType: INTERVAL_MAP[interval].intervalType,
      intervalLength: INTERVAL_MAP[interval].intervalLength,
      accumulation: "max",
      aggregation: "first",
      historical: true,
    },
    locale
  );

  return (
    <div className={cn(size === "large" && "mb-4")}>
      <AreaChartComponent
        data={timeseries}
        config={chartConfig}
        title={t("total-supply.title")}
        description={t("total-supply.description")}
        xAxis={{ key: "timestamp" }}
        showYAxis={true}
        info={`${t("last-updated")}: ${timeseries.at(-1)?.timestamp}`}
        chartContainerClassName={cn(size === "large" && "h-[14rem] w-full")}
      />
    </div>
  );
}
