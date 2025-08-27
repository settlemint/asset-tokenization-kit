import type { AssetExtension } from "@atk/zod/asset-extensions";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";

export const ASSET_CLASS_MAPPING = {
  bond: "fixedIncome",
  equity: "flexibleIncome",
  fund: "flexibleIncome",
  stablecoin: "cashEquivalent",
  deposit: "cashEquivalent",
} as const;

export const DEFAULT_EXTENSIONS_BY_TYPE = {
  bond: [
    AssetExtensionEnum.ACCESS_MANAGED,
    AssetExtensionEnum.BOND,
    AssetExtensionEnum.CAPPED,
    AssetExtensionEnum.CUSTODIAN,
    AssetExtensionEnum.REDEEMABLE,
    AssetExtensionEnum.YIELD,
  ],
  equity: [
    AssetExtensionEnum.ACCESS_MANAGED,
    AssetExtensionEnum.CAPPED,
    AssetExtensionEnum.CUSTODIAN,
    AssetExtensionEnum.YIELD,
  ],
  fund: [
    AssetExtensionEnum.ACCESS_MANAGED,
    AssetExtensionEnum.FUND,
    AssetExtensionEnum.CAPPED,
    AssetExtensionEnum.CUSTODIAN,
    AssetExtensionEnum.REDEEMABLE,
    AssetExtensionEnum.YIELD,
  ],
  stablecoin: [
    AssetExtensionEnum.ACCESS_MANAGED,
    AssetExtensionEnum.CAPPED,
    AssetExtensionEnum.CUSTODIAN,
  ],
  deposit: [
    AssetExtensionEnum.ACCESS_MANAGED,
    AssetExtensionEnum.CAPPED,
    AssetExtensionEnum.CUSTODIAN,
    AssetExtensionEnum.REDEEMABLE,
    AssetExtensionEnum.YIELD,
  ],
} as const;

export function getAssetClassFromAssetType(
  assetType: (typeof TokenTypeEnum.options)[number]
): (typeof ASSET_CLASS_MAPPING)[keyof typeof ASSET_CLASS_MAPPING] {
  return ASSET_CLASS_MAPPING[assetType];
}

export function getDefaultExtensions(
  assetType: (typeof TokenTypeEnum.options)[number]
): AssetExtension[] {
  return [...(DEFAULT_EXTENSIONS_BY_TYPE[assetType] || [])];
}
