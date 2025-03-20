import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { PieChartComponent } from "@/components/blocks/charts/pie-chart";
import { ChartPieIcon } from "@/components/ui/animated-icons/chart-pie";
import type { ChartConfig } from "@/components/ui/chart";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { AssetType } from "@/lib/utils/zod";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface CollateralRatioProps {
  address: Address;
  assettype: AssetType;
}

export async function CollateralRatio({
  address,
  assettype,
}: CollateralRatioProps) {
  const t = await getTranslations("components.charts.assets");

  const chartConfig = {
    freeCollateral: {
      label: t("free-collateral-ratio.label"),
      color: "var(--chart-1)",
    },
    committedCollateral: {
      label: t("used-collateral-ratio.label"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const data = await getAssetDetail({ address, assettype });

  if (!data || ("collateral" in data && data.collateral === 0)) {
    return (
      <ChartSkeleton title={t("collateral-ratio.label")} variant="noData">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartPieIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("collateral-ratio.no-data")}</p>
        </div>
      </ChartSkeleton>
    );
  }

  const collateralData: { name: string; value: number }[] = [
    {
      name: "freeCollateral",
      value: "freeCollateral" in data ? (data.freeCollateral as number) : 0,
    },
    {
      name: "committedCollateral",
      value:
        "collateral" in data && "freeCollateral" in data
          ? (data.collateral as number) - (data.freeCollateral as number)
          : 0,
    },
  ];

  return (
    <PieChartComponent
      description={t("collateral-ratio.description")}
      title={t("collateral-ratio.label")}
      data={collateralData}
      dataKey="value"
      nameKey="name"
      config={chartConfig}
    />
  );
}
