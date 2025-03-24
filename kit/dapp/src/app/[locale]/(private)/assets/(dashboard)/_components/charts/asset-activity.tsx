import { BarChartComponent } from "@/components/blocks/charts/bar-charts/horizontal-bar-chart";
import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import type { ChartConfig } from "@/components/ui/chart";
import { getAssetActivity } from "@/lib/queries/asset-activity/asset-activity";
import { getTranslations } from "next-intl/server";

export async function AssetActivity() {
  const t = await getTranslations("admin.dashboard.charts");
  const data = await getAssetActivity();

  const chartConfig = {
    mintEventCount: {
      label: t("asset-activity.mint"),
      color: "var(--chart-1)",
    },
    transferEventCount: {
      label: t("asset-activity.transfer"),
      color: "var(--chart-2)",
    },
    burnEventCount: {
      label: t("asset-activity.burn"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const isEmpty = data.every(
    (asset) =>
      asset.mintEventCount === 0 &&
      asset.burnEventCount === 0 &&
      asset.transferEventCount === 0
  );

  if (isEmpty) {
    return <ChartSkeleton title={t("asset-activity.title")} variant="noData" />;
  }

  // Convert bigint values to numbers for the chart component
  const chartData = data.map((asset) => ({
    id: asset.id,
    assetType: asset.assetType,
    mintEventCount: asset.mintEventCount,
    burnEventCount: asset.burnEventCount,
    transferEventCount: asset.transferEventCount,
    frozenEventCount: asset.frozenEventCount,
    unfrozenEventCount: asset.unfrozenEventCount,
  }));

  return (
    <BarChartComponent
      data={chartData}
      config={chartConfig}
      title={t("asset-activity.title")}
      description={t("asset-activity.description")}
      xAxis={{
        key: "assetType",
        assetTypeFormatter: true,
      }}
    />
  );
}
