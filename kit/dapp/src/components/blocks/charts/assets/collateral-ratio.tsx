import { PieChartComponent } from "@/components/blocks/charts/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface CollateralRatioProps {
  address: Address;
}

export async function CollateralRatio({ address }: CollateralRatioProps) {
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

  const data = await getStableCoinDetail({ address });
  const collateralData = [
    {
      name: "freeCollateral",
      value: data.freeCollateral,
    },
    {
      name: "committedCollateral",
      value: data.collateral - data.freeCollateral,
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
