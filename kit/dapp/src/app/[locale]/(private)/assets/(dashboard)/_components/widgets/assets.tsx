import { getSidebarAssets } from "@/lib/queries/sidebar-assets/sidebar-assets";
import type { FormatOptions } from "@/lib/utils/number";
import { formatNumber } from "@/lib/utils/number";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
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

  // Helper function to format numbers and handle both string and object returns
  const formatAsDisplay = (
    value: number,
    options: { locale: Locale; decimals?: number }
  ): ReactNode => {
    const formatted = formatNumber(value, options as FormatOptions);
    if (typeof formatted === "string") {
      return formatted;
    }
    return formatted.compactValue;
  };

  // Helper function that always returns a string for use in the subtext
  const formatAsString = (
    value: number,
    options: { locale: Locale; decimals?: number }
  ): string => {
    const formatted = formatNumber(value, options as FormatOptions);
    if (typeof formatted === "string") {
      return formatted;
    }
    return formatted.compactValue;
  };

  return (
    <Widget
      label={t("assets.label")}
      value={formatAsDisplay(allAssetsCount, { locale, decimals: 0 })}
      subtext={t("assets.subtext", {
        stableCoins: formatAsString(getAssetCount("stablecoin"), {
          locale,
          decimals: 0,
        }),
        bonds: formatAsString(getAssetCount("bond"), { locale, decimals: 0 }),
        cryptocurrencies: formatAsString(getAssetCount("cryptocurrency"), {
          locale,
          decimals: 0,
        }),
        equities: formatAsString(getAssetCount("equity"), {
          locale,
          decimals: 0,
        }),
        funds: formatAsString(getAssetCount("fund"), { locale, decimals: 0 }),
        deposits: formatAsString(getAssetCount("deposit"), {
          locale,
          decimals: 0,
        }),
      })}
    />
  );
}
