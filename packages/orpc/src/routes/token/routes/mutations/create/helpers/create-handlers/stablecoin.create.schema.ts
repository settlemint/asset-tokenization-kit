import { TokenBaseSchema } from "../token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import { z } from "zod";

/**
 * Stablecoin token specific schema
 */
export const StablecoinTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.stablecoin),
});
