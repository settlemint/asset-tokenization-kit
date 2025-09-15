import type { Context } from "@/orpc/context/context";
import {
  type AssetType,
  getFactoryTypeIdFromAssetType,
} from "@atk/zod/asset-types";

export function getTokenFactory(context: Context, type: AssetType) {
  return context.system?.tokenFactoryRegistry.tokenFactories.find(
    (tokenFactory) =>
      tokenFactory.typeId === getFactoryTypeIdFromAssetType(type)
  );
}
