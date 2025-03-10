import { BarChartComponent } from "@/components/blocks/charts/bar-charts/horizontal-bar-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import type { ChartConfig } from "@/components/ui/chart";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface AssetDistributionProps {
  address: Address;
}

interface DistributionBucket {
  [key: string]: string | number;
  range: string;
  count: number;
}

export async function AssetDistribution({ address }: AssetDistributionProps) {
  const t = await getTranslations("components.charts.assets");
  const data = await getAssetBalanceList({ address });

  // If there's no data, return a skeleton state
  if (!data || data.length === 0) {
    return (
      <ChartSkeleton title={t("asset-distribution")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("asset-distribution-no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  // Convert string values to numbers and sort by value
  const sortedBalances = data
    .map((balance) => ({
      value: balance.value,
      account: balance.account.id,
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate the maximum value and create dynamic ranges
  const maxValue = Math.max(...sortedBalances.map((b) => b.value));

  // Create 5 ranges from 0 to maxValue
  const ranges = [
    0,
    maxValue * 0.02, // 2% of max
    maxValue * 0.1, // 10% of max
    maxValue * 0.2, // 20% of max
    maxValue * 0.4, // 40% of max
    maxValue, // 100% of max
  ];

  // Create buckets for each range
  const buckets: DistributionBucket[] = [];

  for (let i = 0; i < ranges.length - 1; i++) {
    const minValue = ranges[i];
    const maxValue = ranges[i + 1];
    // Count holders that fall within this specific range
    const count = sortedBalances.filter(
      (b) => b.value >= minValue && b.value < maxValue
    ).length;

    buckets.push({
      range: `${minValue.toFixed(0)}-${maxValue.toFixed(0)}`,
      count,
    });
  }

  // Special handling for the last bucket to include the maximum value
  if (buckets.length > 0) {
    const lastBucket = buckets[buckets.length - 1];
    const [min, max] = lastBucket.range.split("-").map(Number);
    // Recount the last bucket to include holders with exactly the maximum value
    lastBucket.count = sortedBalances.filter(
      (b) => b.value >= min && b.value <= max
    ).length;
  }

  const chartConfig = {
    count: {
      label: "Number of Wallets",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Define colors for each bucket
  const bucketColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <BarChartComponent
      data={buckets}
      config={chartConfig}
      title={t("wallet-distribution")}
      description={t("wallet-distribution-description")}
      xAxis={{
        key: "range",
        tickMargin: 20,
      }}
      showYAxis={true}
      showLegend={false}
      colors={bucketColors}
    />
  );
}
