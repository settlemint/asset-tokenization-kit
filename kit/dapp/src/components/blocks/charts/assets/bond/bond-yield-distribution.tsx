import { AreaChartComponent } from "@/components/blocks/charts/area-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { createTimeSeries } from "@/lib/charts";
import { getBondYieldDistribution } from "@/lib/queries/bond/bond-yield-distribution";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondYieldDistributionProps {
  address: Address;
}

export async function BondYieldDistribution({ address }: BondYieldDistributionProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    totalYield: {
      label: t("yield-distribution.total-yield-label"),
      color: "var(--chart-1)",
    },
    claimed: {
      label: t("yield-distribution.claimed-label"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  try {
    const data = await getBondYieldDistribution({ address });

    if (!data || data.length === 0) {
      return (
        <ChartSkeleton title={t("yield-distribution.title")} variant="noData">
          <div className="flex flex-col items-center gap-2 text-center">
            <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
            <p>{t("yield-distribution.no-data")}</p>
          </div>
        </ChartSkeleton>
      );
    }

    const locale = await getLocale();

    const timeseries = createTimeSeries(
      data,
      ["totalYield", "claimed"],
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
        title={t("yield-distribution.title")}
        xAxis={{ key: "timestamp" }}
        showYAxis={true}
        stacked={false}
      />
    );
  } catch (error) {
    console.error("Error fetching yield distribution data:", error);

    return (
      <ChartSkeleton title={t("yield-distribution.title")} variant="error">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("yield-distribution.error")}</p>
        </div>
      </ChartSkeleton>
    );
  }
}