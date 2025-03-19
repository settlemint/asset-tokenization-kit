import { getAssetActivity } from "@/lib/queries/asset-activity/asset-activity";
import { formatNumber } from "@/lib/utils/number";
import { BigNumber } from "bignumber.js";
import { getLocale, getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function AssetsWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const locale = await getLocale();
  const data = await getAssetActivity();
  const allAssetsSupply = data.reduce(
    (acc, asset) => acc.plus(asset.totalSupply),
    new BigNumber(0)
  );

  const getAssetSupply = (assetType: (typeof data)[number]["assetType"]) => {
    return (
      data.find((asset) => asset.assetType === assetType)?.totalSupply || 0
    );
  };

  return (
    <Widget
      label={t("assets.label")}
      value={formatNumber(allAssetsSupply, { locale })}
      subtext={t("assets.subtext", {
        stableCoins: formatNumber(getAssetSupply("stablecoin"), { locale }),
        bonds: formatNumber(getAssetSupply("bond"), { locale }),
        cryptocurrencies: formatNumber(getAssetSupply("cryptocurrency"), {
          locale,
        }),
        equities: formatNumber(getAssetSupply("equity"), { locale }),
        funds: formatNumber(getAssetSupply("fund"), { locale }),
        tokenizedDeposits: formatNumber(getAssetSupply("tokenizeddeposit"), {
          locale,
        }),
      })}
    />
  );
}
