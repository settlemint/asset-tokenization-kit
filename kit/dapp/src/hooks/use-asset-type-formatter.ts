"use client";

import { useTranslations } from "next-intl";

export function useAssetTypeFormatter() {
  const t = useTranslations("admin.charts.asset-type-formatter");

  const formatAssetType = (type: string): string => {
    const assetType = type.toLowerCase();
    switch (assetType) {
      case "bond":
        return t("bonds");
      case "cryptocurrency":
        return t("cryptocurrencies");
      case "equity":
        return t("equities");
      case "fund":
        return t("funds");
      case "stablecoin":
        return t("stablecoins");
      case "tokenizeddeposit":
        return t("tokenizeddeposit");
      default:
        return type;
    }
  };

  return formatAssetType;
}
