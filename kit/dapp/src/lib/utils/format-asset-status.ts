import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";

type AssetOrBalance = AssetBalance | { paused?: boolean };

export function formatAssetStatus<
  T extends (key: "active" | "paused" | "blocked") => unknown,
>(assetOrBalance: AssetOrBalance, t: T) {
  if (isAssetBalance(assetOrBalance)) {
    if (assetOrBalance.blocked) {
      return t("blocked");
    }
    if (assetOrBalance.asset.paused) {
      return t("paused");
    }
  }
  if (isAsset(assetOrBalance)) {
    if (assetOrBalance.paused) {
      return t("paused");
    }
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
