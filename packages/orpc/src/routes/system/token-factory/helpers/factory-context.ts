import { type AssetType, getFactoryTypeIdFromAssetType } from "@atk/zod/validators/asset-types";
import type { Context } from "@/context/context";

export function getTokenFactory(context: Context, type: AssetType) {
  return context.system?.tokenFactories.find(
    (tokenFactory) => tokenFactory.typeId === getFactoryTypeIdFromAssetType(type)
  );
}
