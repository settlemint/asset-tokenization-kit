import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TotalSupplyChangedProps {
  address: Address;
}

export async function TotalSupplyChanged({ address }: TotalSupplyChangedProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    totalMinted: {
      label: t("total-supply-changed.minted-label"),
      color: "var(--chart-1)",
    },
    totalBurned: {
      label: t("total-supply-changed.burned-label"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const data = await getAssetStats({ address });

  const timeseries = createTimeSeries(data, ["totalMinted", "totalBurned"], {
    granularity: "hour",
    intervalType: "day",
    intervalLength: 1,
    aggregation: "first",
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t("total-supply-changed.title")}
      description={t("total-supply-changed.description")}
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
      footer={
        <div className="text-muted-foreground text-xs">
          {t("last-updated")}: {timeseries.at(-1)?.timestamp}
        </div>
      }
    />
  );
}
