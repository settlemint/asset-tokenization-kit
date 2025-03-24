import { getSidebarAssets } from "@/lib/queries/sidebar-assets/sidebar-assets";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function AssetsWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const locale = await getLocale();
  const counts = await getSidebarAssets();

  const getAssetCount = (assetType: keyof typeof counts) => {
    return counts[assetType].count;
  };
  const allAssetsCount = Object.values(counts).reduce(
    (acc, asset) => acc + asset.count,
    0
  );

  return (
    <Widget
      label={t("assets.label")}
      value={formatNumber(allAssetsCount, { locale, decimals: 0 })}
      subtext={t("assets.subtext", {
        stableCoins: formatNumber(getAssetCount("stablecoin"), {
          locale,
          decimals: 0,
        }),
        bonds: formatNumber(getAssetCount("bond"), { locale, decimals: 0 }),
        cryptocurrencies: formatNumber(getAssetCount("cryptocurrency"), {
          locale,
          decimals: 0,
        }),
        equities: formatNumber(getAssetCount("equity"), {
          locale,
          decimals: 0,
        }),
        funds: formatNumber(getAssetCount("fund"), { locale, decimals: 0 }),
        tokenizedDeposits: formatNumber(getAssetCount("tokenizeddeposit"), {
          locale,
          decimals: 0,
        }),
      })}
    />
  );
}
