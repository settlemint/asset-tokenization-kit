"use client";

import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { useTranslations } from "@/i18n/translation";

interface AssetTypeProps {
  assettype: AssetType;
  plural?: boolean;
}

export function ColumnAssetType({ assettype, plural }: AssetTypeProps) {
  const t = useTranslations("asset-type");

  switch (assettype) {
    case "bond":
      return plural ? t("bonds-plural") : t("bonds");
    case "cryptocurrency":
      return plural ? t("cryptocurrencies-plural") : t("cryptocurrencies");
    case "stablecoin":
      return plural ? t("stablecoins-plural") : t("stablecoins");
    case "deposit":
      return plural ? t("deposits-plural") : t("deposits");
    case "equity":
      return plural ? t("equities-plural") : t("equities");
    case "fund":
      return plural ? t("funds-plural") : t("funds");
    default:
      return t("unknown");
  }
}
