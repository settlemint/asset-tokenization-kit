import { getAssetColor } from "@/components/blocks/asset-type-icon/asset-color";
import { PieChartComponent } from "@/components/blocks/charts/pie-chart";
import { getAssetActivity } from "@/lib/queries/asset-activity/asset-activity";
import { getTranslations } from "next-intl/server";

export async function AssetsSupply() {
  const t = await getTranslations("admin.dashboard.charts");
  const data = await getAssetActivity();
  const chartData = data.map((item) => ({
    assetType: item.assetType,
    totalSupply: Number(item.totalSupply),
  }));

  type AssetType = Awaited<
    ReturnType<typeof getAssetActivity>
  >[number]["assetType"];

  const config: Record<AssetType, { label: string; color: string }> = {
    bond: {
      label: t("asset-types.bonds"),
      color: getAssetColor("bond", "color"),
    },
    cryptocurrency: {
      label: t("asset-types.cryptocurrencies"),
      color: getAssetColor("cryptocurrency", "color"),
    },
    equity: {
      label: t("asset-types.equities"),
      color: getAssetColor("equity", "color"),
    },
    fund: {
      label: t("asset-types.funds"),
      color: getAssetColor("fund", "color"),
    },
    stablecoin: {
      label: t("asset-types.stablecoins"),
      color: getAssetColor("stablecoin", "color"),
    },
    deposit: {
      label: t("asset-types.deposit"),
      color: getAssetColor("deposit", "color"),
    },
  };
  return (
    <PieChartComponent
      description={t("assets-supply.description")}
      title={t("assets-supply.title")}
      data={chartData}
      dataKey="totalSupply"
      nameKey="assetType"
      config={config}
    />
  );
}
