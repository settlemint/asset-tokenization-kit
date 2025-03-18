"use client";

import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";
import { useTranslations } from "next-intl";

type AssetOrBalance = AssetBalance | { paused?: boolean };

interface AssetStatusProps {
  assetOrBalance: AssetOrBalance;
}

export function ColumnAssetStatus({ assetOrBalance }: AssetStatusProps) {
  const t = useTranslations("asset-status");

  if (isAssetBalance(assetOrBalance)) {
    if (assetOrBalance.blocked) {
      return t("blocked");
    }
    if (assetOrBalance.asset.paused) {
      return t("paused");
    }
  }
  if (isAsset(assetOrBalance) && assetOrBalance.paused) {
    return t("paused");
  }
  return t("active");
}

function isAssetBalance(
  assetBalance: AssetOrBalance
): assetBalance is AssetBalance {
  return "blocked" in assetBalance;
}

function isAsset(asset: AssetOrBalance): asset is { paused?: boolean } {
  return "paused" in asset;
}
