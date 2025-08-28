import {
  BarChart3,
  Building,
  Coins,
  Package,
  PiggyBank,
  Wallet,
} from "lucide-react";

export const assetIcons = {
  bond: Building,
  equity: BarChart3,
  fund: PiggyBank,
  stablecoin: Coins,
  deposit: Wallet,
} as const;

export const getAssetIcon = (assetType: string) => {
  return assetType in assetIcons
    ? assetIcons[assetType as keyof typeof assetIcons]
    : Package;
};
