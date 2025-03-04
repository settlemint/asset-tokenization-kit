import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getTranslations } from "next-intl/server";
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

  const timeseries = createTimeSeries(data, ["totalSupply"], {
    granularity: "hour",
    intervalType: "day",
    intervalLength: 1,
    accumulation: "max",
    aggregation: "first",
    historical: true,
  });

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
