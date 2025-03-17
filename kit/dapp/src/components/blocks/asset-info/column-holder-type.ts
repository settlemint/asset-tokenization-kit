"use client";

import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-fragment";
import { useTranslations } from "next-intl";

interface HolderTypeProps {
  assetBalance: AssetBalance;
}

export function ColumnHolderType({ assetBalance }: HolderTypeProps) {
  const t = useTranslations("asset-info");
  if (assetBalance.asset.creator.id === assetBalance.account.id) {
    return t("creator-owner");
  }
  if (
    assetBalance.asset.admins.some(
      (admin) => admin.id === assetBalance.account.id
    )
  ) {
    return t("admin");
  }
  if (
    assetBalance.asset.supplyManagers.some(
      (manager) => manager.id === assetBalance.account.id
    )
  ) {
    return t("supply-manager");
  }
  return t("regular");
}
