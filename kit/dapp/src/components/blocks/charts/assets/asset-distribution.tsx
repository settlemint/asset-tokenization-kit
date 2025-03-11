import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { VerticalBarChartComponent } from "../bar-charts/vertical-bar-chart";

interface AssetDistributionProps {
  address: Address;
}

export async function AssetDistribution({ address }: AssetDistributionProps) {
  const t = await getTranslations("components.charts.assets");
  const data = await getUserAssetsBalance(address, true);

  // If there's no data, return a skeleton state
  if (!data || data.balances.length === 0) {
    return (
      <ChartSkeleton title={t("asset-distribution")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("asset-distribution-no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const chartConfig = {
    count: {
      label: "Number of Wallets",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const chartData = data.distribution.map((item, index) => {
    return {
      assetType: t(`asset-type-pluralizer.${item.asset.type}`),
      percentage: item.percentage,
      fill: `var(--chart-${index + 1})`,
    };
  });

  return (
    <VerticalBarChartComponent
      data={chartData}
      config={chartConfig}
      title="Asset Distribution"
      description="Portfolio allocation by asset type"
      yAxis={{
        key: "assetType",
      }}
      valueKey="percentage"
    />
  );
}
