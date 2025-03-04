import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface TotalTransfersProps {
  address: Address;
}

export async function TotalTransfers({ address }: TotalTransfersProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    totalTransfers: {
      label: t("total-transfers.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const data = await getAssetStats({ address });

  if (!data || data.every((d) => d.totalTransfers === 0)) {
    return (
      <ChartSkeleton title={t("total-transfers.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("total-transfers.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const timeseries = createTimeSeries(data, ["totalTransfers"], {
    granularity: "hour",
    intervalType: "day",
    intervalLength: 1,
    aggregation: "first",
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t("total-transfers.title")}
      description={t("total-transfers.description")}
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
      info={`${t("last-updated")}: ${timeseries.at(-1)?.timestamp}`}
    />
  );
}
