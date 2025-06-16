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
    clawbackEventCount: {
      label: t("asset-activity.clawback"),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const isEmpty = data.every(
    (asset) =>
      asset.mintEventCount === BigInt(0) &&
      asset.burnEventCount === BigInt(0) &&
      asset.transferEventCount === BigInt(0) &&
      asset.clawbackEventCount === BigInt(0)
  );

  if (isEmpty) {
    return <ChartSkeleton title={t("asset-activity.title")} variant="noData" />;
  }

  // Convert bigint values to numbers for the chart component
  const chartData = data.map((asset) => ({
    id: asset.id,
    assetType: asset.assetType,
    mintEventCount: Number(asset.mintEventCount),
    burnEventCount: Number(asset.burnEventCount),
    transferEventCount: Number(asset.transferEventCount),
    frozenEventCount: Number(asset.frozenEventCount),
    unfrozenEventCount: Number(asset.unfrozenEventCount),
    clawbackEventCount: Number(asset.clawbackEventCount),
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
