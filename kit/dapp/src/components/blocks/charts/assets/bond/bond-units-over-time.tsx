import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondUnitsOverTimeProps {
  address: Address;
}

export async function BondUnitsOverTime({ address }: BondUnitsOverTimeProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    totalSupply: {
      label: t("units-over-time.label"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const data = await getAssetStats({ address, days: 180 });

  if (!data || data.every((d) => d.totalSupply === 0)) {
    return (
      <ChartSkeleton title={t("units-over-time.title")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("units-over-time.no-data")}</p>
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
      intervalType: "month",
      intervalLength: 6,
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
      title={t("units-over-time.title")}
      xAxis={{ key: "timestamp" }}
      showYAxis={true}
    />
  );
}