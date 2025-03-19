import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TotalSupplyProps {
  address: Address;
}

export async function TotalSupply({ address }: TotalSupplyProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    totalSupply: {
      label: t("total-supply.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

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

  const timeseries = createTimeSeries(
    data,
    ["totalSupply"],
    {
      granularity: "day",
      intervalType: "week",
      intervalLength: 1,
      accumulation: "max",
      aggregation: "first",
      historical: true,
    },
    locale
  );

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t("total-supply.title")}
      description={t("total-supply.description")}
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
      info={`${t("last-updated")}: ${timeseries.at(-1)?.timestamp}`}
    />
  );
}
