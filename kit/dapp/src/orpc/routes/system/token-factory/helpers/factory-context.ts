import {
  AssetType,
  getFactoryTypeIdFromAssetType,
} from "@/lib/zod/validators/asset-types";
import { Context } from "@/orpc/context/context";

export function getTokenFactory(context: Context, type: AssetType) {
  return context.system?.tokenFactories.find(
    (tokenFactory) =>
      tokenFactory.typeId === getFactoryTypeIdFromAssetType(type)
  );
}
