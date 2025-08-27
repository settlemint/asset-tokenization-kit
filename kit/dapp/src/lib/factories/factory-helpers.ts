import type { SingleFactory } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import type { TFunction } from "i18next";

/**
 * Creates a factory input object for a given asset type
 * @param assetType - The type of asset to create a factory for
 * @param t - Translation function from react-i18next
 * @returns SingleFactory object with type and localized name
 */
export function createFactoryInput(
  assetType: typeof TokenTypeEnum.options[number],
  t: TFunction<any, any>
): SingleFactory {
  return {
    type: assetType,
    name: t(`types.${assetType}.name`, { ns: "asset-types" }),
  };
}

/**
 * Common namespaces used for asset type translations
 */
export const ASSET_TYPE_NAMESPACES = [
  "onboarding",
  "common",
  "tokens",
  "navigation",
  "errors",
  "asset-types",
] as const;