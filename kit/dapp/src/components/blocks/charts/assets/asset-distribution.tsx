import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
import { PieChartComponent } from "@/components/blocks/charts/pie-chart";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface AssetDistributionProps {
  address: Address;
}

export async function AssetDistribution({ address }: AssetDistributionProps) {
  const t = await getTranslations("components.charts.assets");
  const data = await getUserAssetsBalance(address);
  const chartData = data.distribution.map((item) => {
    return {
      assetType: item.asset.type,
      percentage: item.percentage,
    };
  });

  type AssetType = Awaited<
    ReturnType<typeof getUserAssetsBalance>
  >["distribution"][number]["asset"]["type"];

  const config: Record<AssetType, { label: string; color: string }> = {
    bond: {
      label: t("bond"),
      color: getAssetColor("bond", "color"),
    },
    equity: {
      label: t("equity"),
      color: getAssetColor("equity", "color"),
    },
    fund: {
      label: t("fund"),
      color: getAssetColor("fund", "color"),
    },
    stablecoin: {
      label: t("stablecoin"),
      color: getAssetColor("stablecoin", "color"),
    },
    cryptocurrency: {
      label: t("cryptocurrency"),
      color: getAssetColor("cryptocurrency", "color"),
    },
    deposit: {
      label: t("deposit"),
      color: getAssetColor("deposit", "color"),
    },
  };

  return (
    <PieChartComponent
      description={t("asset-distribution-description")}
      title={t("asset-distribution")}
      data={chartData}
      dataKey="percentage"
      nameKey="assetType"
      config={config}
    />
  );
}
