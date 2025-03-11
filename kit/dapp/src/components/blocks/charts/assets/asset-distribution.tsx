import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
import { PieChartComponent } from "@/components/blocks/charts/pie-chart";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface AssetDistributionProps {
  address: Address;
}

export async function AssetDistribution({ address }: AssetDistributionProps) {
  const tAssets = await getTranslations("components.charts.assets");
  const tAssetTypes = await getTranslations("portfolio.asset-types");
  const data = await getUserAssetsBalance(address, true);
  const chartData = data.distribution.map((item, index) => {
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
      label: tAssetTypes("bond"),
      color: getAssetColor("bond", "color"),
    },
    equity: {
      label: tAssetTypes("equity"),
      color: getAssetColor("equity", "color"),
    },
    fund: {
      label: tAssetTypes("fund"),
      color: getAssetColor("fund", "color"),
    },
    stablecoin: {
      label: tAssetTypes("stablecoin"),
      color: getAssetColor("stablecoin", "color"),
    },
  };

  return (
    <PieChartComponent
      description={tAssets("asset-distribution-description")}
      title={tAssets("asset-distribution")}
      data={chartData}
      dataKey="percentage"
      nameKey="assetType"
      config={config}
    />
  );
}
